package com.delivery.rider;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.switchmaterial.SwitchMaterial;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class RiderDashboardActivity extends AppCompatActivity {

    // Target the Android 'localhost' alias IP that strictly resolves to Next.js Local Server
    private static final String API_BASE_URL = "http://10.0.2.2:3000"; 
    private static final String RIDER_ID = "test-mock-rider-uuid"; // To be replaced by Firebase Auth ID
    private static final int POLLING_INTERVAL_MS = 10000; // 10s MVP refresh threshold

    private SwitchMaterial goOnlineSwitch;
    private RecyclerView ordersRecyclerView;
    private OrderAdapter orderAdapter;
    private OkHttpClient client;
    private Handler pollingHandler;
    private Runnable pollingRunnable;
    private boolean isPollingActive = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(Bundle savedInstanceState);
        // Assumes res/layout/activity_rider_dashboard.xml
        setContentView(R.layout.activity_rider_dashboard);

        client = new OkHttpClient();
        pollingHandler = new Handler(Looper.getMainLooper());
        
        goOnlineSwitch = findViewById(R.id.switch_go_online);
        ordersRecyclerView = findViewById(R.id.recycler_view_orders);

        ordersRecyclerView.setLayoutManager(new LinearLayoutManager(this));
        orderAdapter = new OrderAdapter(new ArrayList<>());
        ordersRecyclerView.setAdapter(orderAdapter);

        // Core MVP Event: Rider slides check-in toggle
        goOnlineSwitch.setOnCheckedChangeListener((buttonView, isChecked) -> {
            if (isChecked) {
                initiateCheckInProtocol();
            } else {
                terminatePolling();
            }
        });
    }

    private void initiateCheckInProtocol() {
        JSONObject payload = new JSONObject();
        try {
            payload.put("rider_id", RIDER_ID);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        RequestBody body = RequestBody.create(
                payload.toString(),
                MediaType.parse("application/json; charset=utf-8")
        );

        Request request = new Request.Builder()
                .url(API_BASE_URL + "/api/rider/check-in")
                .post(body)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {
                runOnUiThread(() -> {
                    goOnlineSwitch.setChecked(false);
                    Toast.makeText(RiderDashboardActivity.this, "Network Sync Failed", Toast.LENGTH_SHORT).show();
                });
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                if (response.isSuccessful()) {
                    runOnUiThread(() -> {
                        Toast.makeText(RiderDashboardActivity.this, "150 LKR Commision Deducted. You are ONLINE.", Toast.LENGTH_SHORT).show();
                        startDispatchPolling();
                    });
                } else {
                    runOnUiThread(() -> {
                        goOnlineSwitch.setChecked(false);
                        try {
                            // Extract our explicit JSON 403 Insufficient Ledger Message
                            String responseBody = response.body().string();
                            JSONObject json = new JSONObject(responseBody);
                            String errorMsg = json.optString("error", "Check-in failed");
                            Toast.makeText(RiderDashboardActivity.this, errorMsg, Toast.LENGTH_LONG).show();
                        } catch (Exception e) {
                            Toast.makeText(RiderDashboardActivity.this, "Check-in Failed: Insufficient Balance", Toast.LENGTH_SHORT).show();
                        }
                    });
                }
            }
        });
    }

    private void startDispatchPolling() {
        isPollingActive = true;
        pollingRunnable = new Runnable() {
            @Override
            public void run() {
                if (isPollingActive) {
                    fetchPendingRestaurantOrders();
                    pollingHandler.postDelayed(this, POLLING_INTERVAL_MS); 
                }
            }
        };
        pollingHandler.post(pollingRunnable); // Fire initial burst
    }

    private void terminatePolling() {
        isPollingActive = false;
        if (pollingRunnable != null) {
            pollingHandler.removeCallbacks(pollingRunnable);
        }
        orderAdapter.updateOrders(new ArrayList<>()); // Empty UI safely
        Toast.makeText(this, "You have disconnected from the dispatch matrix.", Toast.LENGTH_SHORT).show();
    }

    private void fetchPendingRestaurantOrders() {
        Request request = new Request.Builder()
                .url(API_BASE_URL + "/api/rider/orders")
                .get()
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {
                Log.e("Dispatch", "Polling HTTP breakdown", e);
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                if (response.isSuccessful() && response.body() != null) {
                    try {
                        String jsonData = response.body().string();
                        JSONObject jsonObject = new JSONObject(jsonData);
                        JSONArray payloadArray = jsonObject.getJSONArray("payload");

                        List<Order> incomingOrders = new ArrayList<>();
                        for (int i = 0; i < payloadArray.length(); i++) {
                            JSONObject orderObj = payloadArray.getJSONObject(i);
                            incomingOrders.add(new Order(
                                    orderObj.getString("id"),
                                    orderObj.getString("restaurant_name"),
                                    orderObj.getDouble("delivery_latitude") + ", " + orderObj.getDouble("delivery_longitude"),
                                    orderObj.getString("delivery_fee")
                            ));
                        }

                        // Pipe orders to the UI Thread 
                        runOnUiThread(() -> orderAdapter.updateOrders(incomingOrders));

                    } catch (JSONException e) {
                         Log.e("Dispatch", "Corrupted JSON parsing from Next.js backend", e);
                    }
                }
            }
        });
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        terminatePolling(); // Guarantee closure memory cleanup
    }

    // ==========================================
    // Inner Models & UI Recycler Binding
    // ==========================================

    public static class Order {
        String id;
        String restaurantName;
        String addressCoords;
        String deliveryFee;

        public Order(String id, String restaurantName, String addressCoords, String deliveryFee) {
            this.id = id;
            this.restaurantName = restaurantName;
            this.addressCoords = addressCoords;
            this.deliveryFee = deliveryFee;
        }
    }

    public class OrderAdapter extends RecyclerView.Adapter<OrderAdapter.OrderViewHolder> {

        private List<Order> orders;

        public OrderAdapter(List<Order> orders) {
            this.orders = orders;
        }

        public void updateOrders(List<Order> freshOrders) {
            this.orders = freshOrders;
            notifyDataSetChanged();
        }

        @NonNull
        @Override
        public OrderViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            // Note: Make sure res/layout/item_order_card.xml exists with corresponding IDs
            View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_order_card, parent, false);
            return new OrderViewHolder(view);
        }

        @Override
        public void onBindViewHolder(@NonNull OrderViewHolder holder, int position) {
            Order order = orders.get(position);
            holder.tvRestaurant.setText(order.restaurantName);
            holder.tvCustomerAddress.setText("Target Lat/Lng: " + order.addressCoords);
            holder.tvDeliveryFee.setText(order.deliveryFee + " LKR Fare");

            holder.btnAccept.setOnClickListener(v -> {
                Toast.makeText(RiderDashboardActivity.this, "Network Lock Initiated on Order: " + order.id.split("-")[0], Toast.LENGTH_SHORT).show();
            });
        }

        @Override
        public int getItemCount() {
            return orders.size();
        }

        class OrderViewHolder extends RecyclerView.ViewHolder {
            TextView tvRestaurant, tvCustomerAddress, tvDeliveryFee;
            Button btnAccept;

            public OrderViewHolder(@NonNull View itemView) {
                super(itemView);
                tvRestaurant = itemView.findViewById(R.id.tv_restaurant_name);
                tvCustomerAddress = itemView.findViewById(R.id.tv_customer_address);
                tvDeliveryFee = itemView.findViewById(R.id.tv_delivery_fee);
                btnAccept = itemView.findViewById(R.id.btn_accept_order);
            }
        }
    }
}
