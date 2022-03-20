#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

// Config start
#define WIFI_NAME ""
#define WIFI_PASSWORD ""
#define API_URL ""
#define API_KEY ""
// Config end

#define BUFSIZE 2048
char buffer[BUFSIZE];
int bufpos = 0;
int countTillUpdate = 4;
bool reading = false;
bool lastLine = false;
bool updateInstandly = true;

void setup() {
  // Init pins
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, HIGH);

  // Init serial
  Serial.begin(115200);

  // Init wifi
  WiFi.mode(WIFI_STA);
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

  // Process serial
  while(Serial.available()) {
    char c = Serial.read();

    // Coninue packet
    if(reading) {
      // End of packet or prevent buffer overflow
      if ((lastLine && c == '\n') || bufpos == BUFSIZE-1) {
        buffer[bufpos] = '\0';
        // Check if we should sent a update request
        if (countTillUpdate == 4 || updateInstandly == true) {
          countTillUpdate = 0;
          updateInstandly = false;
          updateRemoteData();
        } else {
          countTillUpdate++;
        }

        // Clear variables
        Serial.flush();
        bufpos = 0;
        reading = false;
        lastLine = false;
        while(Serial.available()) {
          char c2 = Serial.read();
        }
      }

      // Detect last packet line
      else {
        if(c == '!') {
          lastLine = true;
        }
        buffer[bufpos++] = c;
      }
    }

    // Init new packet
    else if(c == '/') {
      // Detected start char. Start reading the new P1 packet...
      reading = true;
      buffer[bufpos++] = c;
    }
  }
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
  int httpCode = http.POST(buffer);

  // Handle successful response
  if (httpCode > 0) {
    Serial.printf("[HTTP] POST... code: %d\n", httpCode);
    if (httpCode == HTTP_CODE_OK) {
      const String& payload = http.getString();
      Serial.println("Received payload:\n<<");
      Serial.println(payload);
      Serial.println(">>");
    } else if (httpCode == 401) {
      updateInstandly = true;
      const String& payload = http.getString();
      Serial.println("Received payload:\n<<");
      Serial.println(payload);
      Serial.println(">>");
    } else {
      updateInstandly = true;
    }
  }

  // Handle unsuccessful response
  else {
    updateInstandly = true;
    Serial.printf("[HTTP] POST... failed, error: %s\n", http.errorToString(httpCode).c_str());
  }

  // Disable led
  digitalWrite(LED_BUILTIN, HIGH);
}
