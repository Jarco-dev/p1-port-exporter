#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

// Config start
#define WIFI_NAME ""
#define WIFI_PASSWORD ""
#define HW_API_URL ""
#define API_URL ""
#define API_KEY ""
// Config end

String data = "";
bool updateInstantly = true;

void setup() {
  // Init pins
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, HIGH);

  // Init serial
  Serial.begin(9600);

  // Init wifi
  WiFi.mode(WIFI_STA);
  WiFi.setHostname("p1-port-exporter");
  WiFi.begin(WIFI_NAME, WIFI_PASSWORD);
  Serial.println();
  while (WiFi.status() != WL_CONNECTED) {
    digitalWrite(LED_BUILTIN, LOW);
    delay(250);
    digitalWrite(LED_BUILTIN, HIGH);
    delay(250);
    Serial.print(".");
  }
  WiFi.setAutoReconnect(true);
  WiFi.persistent(true);
  Serial.println("");
  Serial.print("Connected! IP address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // Check wifi status
  if (WiFi.status() != WL_CONNECTED) {
    Serial.print("Reconnecting");
    while (WiFi.status() != WL_CONNECTED) {
      digitalWrite(LED_BUILTIN, LOW);
      delay(250);
      digitalWrite(LED_BUILTIN, HIGH);
      delay(250);
      Serial.print(".");
    }
    Serial.println("");
  }

  fetchHomeWizardData();
  if (data != "none") {
    updateRemoteData();
  }
  delay(10000);
}

void fetchHomeWizardData() {
  WiFiClient client;
  HTTPClient http;

  // Create http request
  Serial.print("[HTTP] begin...\n");
  http.begin(client, HW_API_URL);
  http.addHeader("Content-Type", "text/plain");

  // Get request
  Serial.print("[HTTP] GET...\n");
  int httpCode = http.GET();
  data = http.getString();

  // Handle successful response
  if (httpCode > 0) {
    Serial.printf("[HTTP] GET... code: %d\n", httpCode);
    if (httpCode == HTTP_CODE_OK) {
      // const String& payload = http.getString();
      Serial.println("Received payload:\n<<");
      Serial.println(data);
      Serial.println(">>");
    } else if (httpCode == 401) {
      updateInstantly = true;
      Serial.println("Received payload:\n<<");
      Serial.println(data);
      Serial.println(">>");
    } else {
      updateInstantly = true;
    }
  }

  // Handle unsuccessful response
  else {
    data = "none";
    updateInstantly = true;
    Serial.printf("[HTTP] GET... failed, error: %s\n", http.errorToString(httpCode).c_str());
  }

  // Disable led
  digitalWrite(LED_BUILTIN, HIGH);

}

void updateRemoteData() {
  // Enable led
  digitalWrite(LED_BUILTIN, LOW);

  WiFiClient client;
  HTTPClient http;

  // Create http request
  Serial.print("[HTTP] begin...\n");
  http.begin(client, API_URL);
  http.addHeader("Content-Type", "text/plain");
  http.addHeader("authorization", API_KEY);

  // Post request
  Serial.print("[HTTP] POST...\n");
  int httpCode = http.POST(data);

  // Handle successful response
  if (httpCode > 0) {
    Serial.printf("[HTTP] POST... code: %d\n", httpCode);
    if (httpCode == HTTP_CODE_OK) {
      const String& payload = http.getString();
      Serial.println("Received payload:\n<<");
      Serial.println(payload);
      Serial.println(">>");
    } else if (httpCode == 401) {
      updateInstantly = true;
      const String& payload = http.getString();
      Serial.println("Received payload:\n<<");
      Serial.println(payload);
      Serial.println(">>");
    } else {
      updateInstantly = true;
    }
  }

  // Handle unsuccessful response
  else {
    updateInstantly = true;
    Serial.printf("[HTTP] POST... failed, error: %s\n", http.errorToString(httpCode).c_str());
  }

  // Disable led
  digitalWrite(LED_BUILTIN, HIGH);
}
