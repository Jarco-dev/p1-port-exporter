void setup() {
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, HIGH);
}

void loop() {
  digitalWrite(LED_BUILTIN, LOW);

  Serial.println("/ISk5\\2MT382-1000\r");
  Serial.println();
  Serial.println("1-3:0.2.8(50)\r");
  Serial.println("0-0:1.0.0(101209113020W)\r");
  Serial.println("0-0:96.1.1(4B384547303034303436333935353037)\r");
  Serial.println("1-0:1.8.1(123456.789*kWh)\r");
  Serial.println("1-0:1.8.2(123456.789*kWh)\r");
  Serial.println("1-0:2.8.1(123456.789*kWh)\r");
  Serial.println("1-0:2.8.2(123456.789*kWh)\r");
  Serial.println("0-0:96.14.0(0002)\r");
  Serial.println("1-0:1.7.0(01.193*kW)\r");
  Serial.println("1-0:2.7.0(00.000*kW)\r");
  Serial.println("0-0:96.7.21(00004)\r");
  Serial.println("0-0:96.7.9(00002)\r");
  Serial.println("1-0:99.97.0(2)(0-0:96.7.19)(101208152415W)(0000000240*s)(101208151004W)(0000000301*s)\r");
  Serial.println("1-0:32.32.0(00002)\r");
  Serial.println("1-0:52.32.0(00001)\r");
  Serial.println("1-0:72.32.0(00000)\r");
  Serial.println("1-0:32.36.0(00000)\r");
  Serial.println("1-0:52.36.0(00003)\r");
  Serial.println("1-0:72.36.0(00000)\r");
  Serial.println("0-0:96.13.0(303132333435363738393A3B3C3D3E3F303132333435363738393A3B3C3D3E3F303132333435363738393A3B3C 3D3E3F303132333435363738393A3B3C3D3E3F303132333435363738393A3B3C3D3E3F)\r");
  Serial.println("1-0:32.7.0(220.1*V)\r");
  Serial.println("1-0:52.7.0(220.2*V)\r");
  Serial.println("1-0:72.7.0(220.3*V)\r");
  Serial.println("1-0:31.7.0(001*A)\r");
  Serial.println("1-0:51.7.0(002*A)\r");
  Serial.println("1-0:71.7.0(003*A)\r");
  Serial.println("1-0:21.7.0(01.111*kW)\r");
  Serial.println("1-0:41.7.0(02.222*kW)\r");
  Serial.println("1-0:61.7.0(03.333*kW)\r");
  Serial.println("1-0:22.7.0(04.444*kW)\r");
  Serial.println("1-0:42.7.0(05.555*kW)\r");
  Serial.println("1-0:62.7.0(06.666*kW)\r");
  Serial.println("0-1:24.1.0(003)\r");
  Serial.println("0-1:96.1.0(3232323241424344313233343536373839)\r");
  Serial.println("0-1:24.2.1(101209112500W)(12785.123*m3)\r");
  Serial.println("!EF2F");

  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);
}
