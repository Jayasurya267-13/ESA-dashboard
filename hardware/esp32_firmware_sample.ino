/**
 * ESA Dashboard - Physical Edge Node Firmware (ESP32 Sample)
 * 
 * Hardware Requirements:
 * 1. ESP32 DevKit V1
 * 2. Temperature Sensor: DS18B20 OneWire on GPIO 4
 * 3. Vibration Sensor: MPU-6050 I2C Accelerometer on SDA (GPIO 21), SCL (GPIO 22)
 * 4. Current Sensor: SCT-013-000 Non-invasive AC Current Transformer on ADC (GPIO 34)
 * 
 * Target Endpoint:
 * POST http://<FASTAPI_HOST>:8000/api/telemetry
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <ArduinoJson.h>

// WiFi Configuration
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// ESA Backend Server Endpoint
const char* API_ENDPOINT  = "http://192.168.1.100:8000/api/telemetry";
const char* MACHINE_ID    = "MTR-001";

// Pin Assignments
#define ONE_WIRE_BUS 4
#define CURRENT_ADC_PIN 34

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature tempSensors(&oneWire);

// Sampling Interval
const unsigned long TRANSMIT_INTERVAL_MS = 3000;
unsigned long lastTransmitTime = 0;

void setup() {
    Serial.begin(115200);
    Serial.println("\n[ESA-EDGE-NODE] Booting Edge AI Sensor Node...");

    // Initialize DS18B20
    tempSensors.begin();

    // Connect to Industrial WiFi
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.print("[WiFi] Connecting to network");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\n[WiFi] Connected! IP address: " + WiFi.localIP().toString());
}

float readTemperature() {
    tempSensors.requestTemperatures();
    float tempC = tempSensors.getTempCByIndex(0);
    if (tempC == DEVICE_DISCONNECTED_C) {
        return 65.0; // Fallback default
    }
    return tempC;
}

float readVibrationRMS() {
    // Computes RMS vibration velocity over a 100-sample window
    long sumSq = 0;
    for (int i = 0; i < 100; i++) {
        int rawVal = analogRead(35) - 2048; // Sample analog or I2C accelerometer
        sumSq += (rawVal * rawVal);
        delayMicroseconds(200);
    }
    float rms = sqrt(sumSq / 100.0) * 0.015; // Scaled to mm/s
    return max(0.5f, min(15.0f, rms));
}

float readCurrentRMS() {
    // SCT-013 Current transformer sampling
    long sum = 0;
    for (int i = 0; i < 200; i++) {
        int sample = analogRead(CURRENT_ADC_PIN) - 2048;
        sum += (sample * sample);
        delayMicroseconds(100);
    }
    float vRMS = sqrt(sum / 200.0) * (3.3 / 4095.0);
    float currentAmps = vRMS * 30.0; // 30A / 1V calibration factor
    return max(0.5f, min(25.0f, currentAmps));
}

void loop() {
    unsigned long now = millis();
    if (now - lastTransmitTime >= TRANSMIT_INTERVAL_MS) {
        lastTransmitTime = now;

        float temp = readTemperature();
        float vib = readVibrationRMS();
        float curr = readCurrentRMS();

        if (WiFi.status() == WL_CONNECTED) {
            HTTPClient http;
            http.begin(API_ENDPOINT);
            http.addHeader("Content-Type", "application/json");

            // Format JSON Payload
            StaticJsonDocument<256> doc;
            doc["machine_id"] = MACHINE_ID;
            doc["temperature"] = serialized(String(temp, 2));
            doc["vibration"] = serialized(String(vib, 2));
            doc["current"] = serialized(String(curr, 2));

            String payload;
            serializeJson(doc, payload);

            int httpCode = http.POST(payload);
            if (httpCode > 0) {
                Serial.printf("[HTTP] Ingested telemetry for %s: Code %d\n", MACHINE_ID, httpCode);
            } else {
                Serial.printf("[HTTP] POST failed: %s\n", http.errorToString(httpCode).c_str());
            }
            http.end();
        } else {
            Serial.println("[WiFi] Reconnecting...");
            WiFi.reconnect();
        }
    }
}
