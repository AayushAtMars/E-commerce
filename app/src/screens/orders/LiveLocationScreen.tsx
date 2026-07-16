import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import WebView from 'react-native-webview';
import type { ProfileStackParamList } from '../../navigation/types';
import Feather from '@expo/vector-icons/Feather';
import { useQuery, useMutation } from '@tanstack/react-query';
import { commerceApiModule } from '../../api/commerce.api';
import { chatApiModule } from '../../api/chat.api';

type ProfileNav = NativeStackNavigationProp<ProfileStackParamList>;
type LiveLocationRoute = RouteProp<ProfileStackParamList, 'TrackLiveLocation'>;

// Warehouse origin — fixed dummy (Mumbai, Andheri West)
const WAREHOUSE_LAT = 19.076;
const WAREHOUSE_LNG = 72.8777;

// Build the HTML dynamically so we can pass the real address for geocoding
function buildMapHtml(addressQuery: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; background: #f4f0ec; }
    .leaflet-control-attribution, .leaflet-control-zoom { display: none !important; }
    .pin-warehouse {
      width: 42px; height: 42px; border-radius: 50%;
      background: #3E1F0F; border: 3px solid #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.35);
    }
    .pin-agent {
      width: 38px; height: 38px; border-radius: 50%;
      background: #F5A623; border: 3px solid #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 17px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
    }
    .pin-dest {
      width: 38px; height: 38px; border-radius: 50%;
      background: #fff; border: 3px solid #F5A623;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
      box-shadow: 0 4px 12px rgba(245,166,35,0.35);
    }
    #loading {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
      font-family: sans-serif; font-size: 14px; color: #888;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div id="loading">Locating address...</div>
  <script>
    var warehouseLat = ${WAREHOUSE_LAT};
    var warehouseLng = ${WAREHOUSE_LNG};
    var addressQuery = ${JSON.stringify(addressQuery)};

    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: false
    }).setView([warehouseLat, warehouseLng], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(map);

    function makeIcon(html, size) {
      size = size || 42;
      return L.divIcon({
        html: html,
        className: '',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
      });
    }

    // Warehouse marker (always fixed)
    L.marker([warehouseLat, warehouseLng], {
      icon: makeIcon('<div class="pin-warehouse">🏪</div>')
    }).addTo(map).bindTooltip('Warehouse, Andheri Mumbai', { permanent: false });

    // Geocode the delivery address using Nominatim (free, no key)
    fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(addressQuery), {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'DeliveryApp/1.0' }
    })
    .then(function(r) { return r.json(); })
    .then(function(results) {
      document.getElementById('loading').style.display = 'none';

      var destLat, destLng;

      if (results && results.length > 0) {
        destLat = parseFloat(results[0].lat);
        destLng = parseFloat(results[0].lon);
      } else {
        // fallback: offset from warehouse by ~5km south-west
        destLat = warehouseLat - 0.045;
        destLng = warehouseLng - 0.046;
      }

      // Mid-point for agent
      var agentLat = (warehouseLat + destLat) / 2;
      var agentLng = (warehouseLng + destLng) / 2;

      // Route polyline
      var route = [
        [warehouseLat, warehouseLng],
        [(warehouseLat * 2 + destLat) / 3, (warehouseLng * 2 + destLng) / 3],
        [agentLat, agentLng],
        [(warehouseLat + destLat * 2) / 3, (warehouseLng + destLng * 2) / 3],
        [destLat, destLng],
      ];

      // Shadow
      L.polyline(route, { color: 'rgba(62,31,15,0.18)', weight: 8, lineCap: 'round' }).addTo(map);
      // Main line
      L.polyline(route, { color: '#3E1F0F', weight: 4, lineCap: 'round', lineJoin: 'round' }).addTo(map);

      // Agent marker
      L.marker([agentLat, agentLng], {
        icon: makeIcon('<div class="pin-agent">🛵</div>', 38)
      }).addTo(map);

      // Destination marker
      L.marker([destLat, destLng], {
        icon: makeIcon('<div class="pin-dest">📍</div>', 38)
      }).addTo(map).bindTooltip('Your Delivery Location', { permanent: false });

      // Fit map to show both warehouse and destination
      var bounds = L.latLngBounds(
        [warehouseLat, warehouseLng],
        [destLat, destLng]
      ).pad(0.25);
      map.fitBounds(bounds);
    })
    .catch(function() {
      document.getElementById('loading').style.display = 'none';
      // On error just show warehouse
    });
  </script>
</body>
</html>
`;
}

export function LiveLocationScreen() {
  const navigation = useNavigation<ProfileNav>();
  const route = useRoute<LiveLocationRoute>();
  const { orderId } = route.params;

  const { data: order } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const res = await commerceApiModule.getOrder(orderId);
      return res.data.data.order;
    },
  });

  const agent = order?.deliveryAgent;

  // Build a full address string from the order's shippingAddress for geocoding
  const deliveryAddressText = useMemo(() => {
    if (!order?.shippingAddress) return '';
    const a = order.shippingAddress;
    return [a.line1, a.floor, a.city, a.state, a.pincode, 'India']
      .filter(Boolean)
      .join(', ');
  }, [order]);

  // Build HTML only when the address is ready (prevents stale map)
  const mapHtml = useMemo(() => {
    const query = deliveryAddressText || 'Bandra West, Mumbai, India';
    return buildMapHtml(query);
  }, [deliveryAddressText]);

  const startChatMutation = useMutation({
    mutationFn: async (partner: any) => {
      const res = await chatApiModule.startChat(partner);
      return res.data.data;
    },
    onSuccess: (data) => {
      (navigation as any).navigate('Chat', {
        screen: 'ChatDetail',
        params: {
          chatId: data.chatId,
          contact: {
            id: agent?._id,
            name: agent?.name,
            avatar: agent?.avatar,
            online: true,
          },
        },
      });
    },
    onError: () => {
      Alert.alert('Error', 'Failed to start chat');
    },
  });

  const handleMessage = () => {
    if (!agent) return;
    startChatMutation.mutate(agent);
  };

  const handleCall = () => {
    if (agent?.phone) {
      Linking.openURL(`tel:${agent.phone}`);
    } else {
      Alert.alert('Call', 'Calling delivery agent...');
    }
  };

  // Friendly display address for bottom card
  const displayAddress = order?.shippingAddress
    ? [
        order.shippingAddress.line1,
        order.shippingAddress.floor,
        order.shippingAddress.city,
        `${order.shippingAddress.state} — ${order.shippingAddress.pincode}`,
      ]
        .filter(Boolean)
        .join(', ')
    : '245 Linking Road, Bandra West, Mumbai — 400050';

  // Calculate ETA date (5 days from booking date)
  const formattedETA = useMemo(() => {
    if (!order?.createdAt) return 'Pending';
    const date = new Date(order.createdAt);
    date.setDate(date.getDate() + 5);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }, [order?.createdAt]);

  return (
    <View style={styles.root}>
      {/* ── Map ── */}
      <View style={styles.mapContainer}>
        <WebView
          key={deliveryAddressText} // remount when address changes
          source={{ html: mapHtml }}
          style={styles.map}
          scrollEnabled={false}
          javaScriptEnabled
          androidLayerType="hardware"
          originWhitelist={['*']}
          mixedContentMode="always"
        />

        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={22} color="#1A1A1A" />
        </TouchableOpacity>

        {/* Header title */}
        <View style={styles.mapTitleBox} pointerEvents="none">
          <Text style={styles.mapTitle}>Track Live Location</Text>
        </View>
      </View>

      {/* ── Bottom card ── */}
      <ScrollView
        style={styles.card}
        contentContainerStyle={styles.cardContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ETA */}
        <View style={styles.etaSection}>
          <Text style={styles.etaLabel}>Estimated Arrival Date</Text>
          <Text style={styles.etaTime}>{formattedETA}</Text>
        </View>

        <View style={styles.hairline} />

        {/* Delivery agent */}
        <View style={styles.agentRow}>
          <Image
            source={{ uri: agent?.avatar || 'https://randomuser.me/api/portraits/men/45.jpg' }}
            style={styles.agentAvatar}
          />
          <View style={styles.agentText}>
            <Text style={styles.agentName}>{agent?.name || 'Rahul Sharma'}</Text>
            <Text style={styles.agentRole}>Delivery Man</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn} onPress={handleMessage}>
            <Feather name="message-square" size={19} color="#3E1F0F" />
          </TouchableOpacity>
          <View style={{ width: 10 }} />
          <TouchableOpacity style={styles.iconBtn} onPress={handleCall}>
            <Feather name="phone" size={19} color="#3E1F0F" />
          </TouchableOpacity>
        </View>

        <View style={styles.hairline} />

        {/* Route info */}
        <View style={styles.routeSection}>
          <View style={styles.routeItem}>
            <View style={styles.dotFilled} />
            <Text style={styles.routeText}>Fashion Store Warehouse, Andheri, Mumbai</Text>
          </View>
          <View style={styles.routeConnector}>
            <View style={styles.connectorLine} />
          </View>
          <View style={styles.routeItem}>
            <View style={styles.dotOutline} />
            <Text style={styles.routeText} numberOfLines={2}>{displayAddress}</Text>
          </View>
        </View>

        <View style={styles.hairline} />

        {/* Order items */}
        <Text style={styles.sectionTitle}>Order Details</Text>
        {order?.items?.map((item: any, idx: number) => (
          <View key={idx} style={styles.orderItem}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.itemMeta}>
                {item.category || 'Clothing'} · Size {item.size || 'M'} · Qty {item.quantity}
              </Text>
              <Text style={styles.itemPrice}>
                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        ))}

        <View style={{ height: 16 }} />
      </ScrollView>
    </View>
  );
}

const BROWN = '#3E1F0F';
const GOLD  = '#F5A623';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F7F7' },

  mapContainer: { height: 300, position: 'relative' },
  map: { ...StyleSheet.absoluteFillObject },
  backBtn: {
    position: 'absolute', top: 50, left: 18,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18, shadowRadius: 6, elevation: 5,
  },
  mapTitleBox: {
    position: 'absolute', top: 54, left: 0, right: 0, alignItems: 'center',
  },
  mapTitle: {
    fontSize: 16, fontWeight: '700', color: '#1A1A1A',
    backgroundColor: 'rgba(255,255,255,0.82)',
    paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: 20, overflow: 'hidden',
  },

  card: {
    flex: 1, backgroundColor: '#fff',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    marginTop: -20,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 10,
  },
  cardContent: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 20 },

  etaSection: { alignItems: 'center', paddingBottom: 20 },
  etaLabel: { fontSize: 12, color: '#AAA', letterSpacing: 0.4, marginBottom: 6 },
  etaTime: { fontSize: 26, fontWeight: '800', color: '#1A1A1A', letterSpacing: 0.5 },

  hairline: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 6 },

  agentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18 },
  agentAvatar: { width: 52, height: 52, borderRadius: 26, marginRight: 14 },
  agentText: { flex: 1 },
  agentName: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  agentRole: { fontSize: 12, color: '#AAA', marginTop: 3 },
  iconBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#FFF5E9', justifyContent: 'center', alignItems: 'center',
  },

  routeSection: { paddingVertical: 18 },
  routeItem: { flexDirection: 'row', alignItems: 'center' },
  dotFilled: { width: 12, height: 12, borderRadius: 6, backgroundColor: BROWN, marginRight: 14 },
  dotOutline: {
    width: 12, height: 12, borderRadius: 6,
    borderWidth: 2.5, borderColor: GOLD, backgroundColor: '#FFF5E9', marginRight: 14,
  },
  routeConnector: { paddingLeft: 5, marginVertical: 5 },
  connectorLine: { width: 2, height: 18, backgroundColor: '#E0E0E0' },
  routeText: { fontSize: 14, color: '#444', flex: 1, lineHeight: 20 },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginTop: 12, marginBottom: 14 },
  orderItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FAFAFA', borderRadius: 16,
    padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  itemImage: { width: 64, height: 64, borderRadius: 12, marginRight: 14, backgroundColor: '#EEE' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  itemMeta: { fontSize: 12, color: '#AAA', marginBottom: 6 },
  itemPrice: { fontSize: 15, fontWeight: '700', color: BROWN },
});
