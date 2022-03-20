// noinspection LanguageDetectionInspection

const express = require("express");
require("dotenv").config();

class MetricsManager {
    constructor() {
        this.updatePort = process.env.UPDATE_PORT;
        this.metricsPort = process.env.METRICS_PORT;
        this.authKey = process.env.API_KEY;

        this.lastData = {};

        this.promClient = require("prom-client");
        this.metrics = {};
        this.createMetrics();

        this.updateApp = express();
        this.updateApp.use(express.text({type: "text/plain"}));
        this.updateApp.disable('x-powered-by');

        this.metricsApp = express();

        this.start();
    }

    start() {
        this.updateApp.post("/update", (req, res) => {
            try {
                if (req.headers.authorization !== this.authKey) {
                    res.status(401).send("Authentication invalid");
                } else {
                    const data = req.body.split("\n");
                    this.lastData = this.parseTelegram(data);
                    res.status(200).send("Updated successfully");
                }
            } catch(err) {
                console.log("Error while handeling update request", err);
                res.status(500).send("A internal server error occurred");
            }
        });

        this.metricsApp.get("/metrics", async (req, res) => {
            try {
                if (this.metrics.dsmrVersion !== {}) {
                    res.set("Content-Type", this.promClient.register.contentType);
                    res.send(await this.promClient.register.metrics());
                }
            } catch(err) {
                console.log("Error while handling metrics request", err);
                res.status(500).json({
                    error: "internal_server_error",
                    error_message: "A internal server error occurred"
                });
            }
        });

        this.updateApp.listen(this.updatePort, () => console.log(`Accepting data on port: ${this.updatePort}`));
        this.metricsApp.listen(this.metricsPort, () => console.log(`Metrics exposed on port: ${this.metricsPort}`));
    }

    createMetrics() {
        // Active tariff
        this.metrics.powerActiveTariff = new this.promClient.Gauge({
            name: "p1_power_active_tariff",
            help: "The current tariff",
            collect: () => {
                this.metrics.powerActiveTariff.set(this.lastData.power.activeTariff);
            }
        })

        // Power consumption
        this.metrics.powerActualConsumed = new this.promClient.Gauge({
            name: "p1_power_actual_consumed",
            help: "The actual power consumed",
            collect: () => {
                this.metrics.powerActualConsumed.set(this.lastData.power.actualConsumed)
            }
        });

        this.metrics.powerTotalConsumedLow = new this.promClient.Gauge({
            name: "p1_power_total_consumed_low",
            help: "The total power consumed during low tariff",
            collect: () => {
                this.metrics.powerTotalConsumedLow.set(this.lastData.power.totalConsumed1);
            }
        });

        this.metrics.powerTotalConsumedNormal = new this.promClient.Gauge({
            name: "p1_power_total_consumed_normal",
            help: "The total power consumed during normal tariff",
            collect: () => {
                this.metrics.powerTotalConsumedNormal.set(this.lastData.power.totalConsumed2);
            }
        });

        // Power production
        this.metrics.powerActualProduced = new this.promClient.Gauge({
            name: "p1_power_actual_produced",
            help: "The actual power produced",
            collect: () => {
                this.metrics.powerActualProduced.set(this.lastData.power.actualProduced);
            }
        });

        this.metrics.powerTotalProducedLow = new this.promClient.Gauge({
            name: "p1_power_total_produced_low",
            help: "The total power produced during low tariff",
            collect: () => {
                this.metrics.powerTotalProducedLow.set(this.lastData.power.totalProduced1);
            }
        });

        this.metrics.powerTotalProducedNormal = new this.promClient.Gauge({
            name: "p1_power_total_produced_normal",
            help: "The total power produced during normal tariff",
            collect: () => {
                this.metrics.powerTotalProducedNormal.set(this.lastData.power.totalProduced2);
            }
        });

        // Power failures
        this.metrics.powerFailures = new this.promClient.Gauge({
            name: "p1_power_failures",
            help: "The total amount of power failures",
            collect: () => {
                this.metrics.powerFailures.set(this.lastData.power.failures);
            }
        });

        this.metrics.powerFailuresLong = new this.promClient.Gauge({
            name: "p1_power_failures_long",
            help: "The total amount of long power failures",
            collect: () => {
                this.metrics.powerFailuresLong.set(this.lastData.power.failuresLong);
            }
        });

        // Power voltage sags
        this.metrics.powerVoltageSagsL1 = new this.promClient.Gauge({
            name: "p1_power_voltage_sags_l1",
            help: "The total amount of voltage sags for L1",
            collect: () => {
                this.metrics.powerVoltageSagsL1.set(this.lastData.power.voltageSagsL1);
            }
        });

        this.metrics.powerVoltageSagsL2 = new this.promClient.Gauge({
            name: "p1_power_voltage_sags_l2",
            help: "The total amount of voltage sags for L2",
            collect: () => {
                this.metrics.powerVoltageSagsL2.set(this.lastData.power.voltageSagsL2);
            }
        });

        this.metrics.powerVoltageSagsL3 = new this.promClient.Gauge({
            name: "p1_power_voltage_sags_l3",
            help: "The total amount of voltage sags for L3",
            collect: () => {
                this.metrics.powerVoltageSagsL3.set(this.lastData.power.voltageSagsL3);
            }
        });

        // Power voltage swells
        this.metrics.powerVoltageSwellsL1 = new this.promClient.Gauge({
            name: "p1_power_voltage_swells_l1",
            help: "The total amount of voltage swells for L1",
            collect: () => {
                this.metrics.powerVoltageSwellsL1.set(this.lastData.power.voltageSwellsL1);
            }
        });

        this.metrics.powerVoltageSwellsL2 = new this.promClient.Gauge({
            name: "p1_power_voltage_swells_l2",
            help: "The total amount of voltage swells for L2",
            collect: () => {
                this.metrics.powerVoltageSwellsL2.set(this.lastData.power.voltageSwellsL2);
            }
        });

        this.metrics.powerVoltageSwellsL3 = new this.promClient.Gauge({
            name: "p1_power_voltage_swells_l3",
            help: "The total amount of voltage swells for L3",
            collect: () => {
                this.metrics.powerVoltageSwellsL3.set(this.lastData.power.voltageSwellsL3);
            }
        });

        // Power instantaneous voltage
        this.metrics.powerInstantaneousVoltageL1 = new this.promClient.Gauge({
            name: "p1_power_instantaneous_voltage_l1",
            help: "The instantaneous voltage for L1",
            collect: () => {
                this.metrics.powerInstantaneousVoltageL1.set(this.lastData.power.instantaneousVoltageL1);
            }
        });

        this.metrics.powerInstantaneousVoltageL2 = new this.promClient.Gauge({
            name: "p1_power_instantaneous_voltage_l2",
            help: "The instantaneous voltage for L2",
            collect: () => {
                this.metrics.powerInstantaneousVoltageL2.set(this.lastData.power.instantaneousVoltageL2);
            }
        });

        this.metrics.powerInstantaneousVoltageL3 = new this.promClient.Gauge({
            name: "p1_power_instantaneous_voltage_l3",
            help: "The instantaneous voltage for L3",
            collect: () => {
                this.metrics.powerInstantaneousVoltageL3.set(this.lastData.power.instantaneousVoltageL3);
            }
        });

        // Power instantaneous current
        this.metrics.powerInstantaneousCurrentL1 = new this.promClient.Gauge({
            name: "p1_power_instantaneous_current_l1",
            help: "The instantaneous current for L1",
            collect: () => {
                this.metrics.powerInstantaneousCurrentL1.set(this.lastData.power.instantaneousCurrentL1);
            }
        });

        this.metrics.powerInstantaneousCurrentL2 = new this.promClient.Gauge({
            name: "p1_power_instantaneous_current_l2",
            help: "The instantaneous current for L2",
            collect: () => {
                this.metrics.powerInstantaneousCurrentL2.set(this.lastData.power.instantaneousCurrentL2);
            }
        });

        this.metrics.powerInstantaneousCurrentL3 = new this.promClient.Gauge({
            name: "p1_power_instantaneous_current_l3",
            help: "The instantaneous current for L3",
            collect: () => {
                this.metrics.powerInstantaneousCurrentL3.set(this.lastData.power.instantaneousCurrentL3);
            }
        });

        // Power instantaneous consumed electricity
        this.metrics.powerInstantaneousConsumedElectricityl1 = new this.promClient.Gauge({
            name: "p1_power_instantaneous_consumed_electricity_l1",
            help: "The instantaneous electricity consumed for L1",
            collect: () => {
                this.metrics.powerInstantaneousConsumedElectricityl1.set(this.lastData.power.instantaneousConsumedElectricityL1);
            }
        });

        this.metrics.powerInstantaneousConsumedElectricityl2 = new this.promClient.Gauge({
            name: "p1_power_instantaneous_consumed_electricity_l2",
            help: "The instantaneous electricity consumed for L2",
            collect: () => {
                this.metrics.powerInstantaneousConsumedElectricityl2.set(this.lastData.power.instantaneousConsumedElectricityL2);
            }
        });

        this.metrics.powerInstantaneousConsumedElectricityl3 = new this.promClient.Gauge({
            name: "p1_power_instantaneous_consumed_electricity_l3",
            help: "The instantaneous electricity consumed for L3",
            collect: () => {
                this.metrics.powerInstantaneousConsumedElectricityl3.set(this.lastData.power.instantaneousConsumedElectricityL3);
            }
        });
        
        // Power instantaneous produced electricity
        this.metrics.powerInstantaneousProducedElectricityl1 = new this.promClient.Gauge({
            name: "p1_power_instantaneous_produced_electricity_l1",
            help: "The instantaneous electricity produced for L1",
            collect: () => {
                this.metrics.powerInstantaneousProducedElectricityl1.set(this.lastData.power.instantaneousProducedElectricityL1);
            }
        });

        this.metrics.powerInstantaneousProducedElectricityl2 = new this.promClient.Gauge({
            name: "p1_power_instantaneous_produced_electricity_l2",
            help: "The instantaneous electricity produced for L2",
            collect: () => {
                this.metrics.powerInstantaneousProducedElectricityl2.set(this.lastData.power.instantaneousProducedElectricityL2);
            }
        });

        this.metrics.powerInstantaneousProducedElectricityl3 = new this.promClient.Gauge({
            name: "p1_power_instantaneous_produced_electricity_l3",
            help: "The instantaneous electricity produced for L3",
            collect: () => {
                this.metrics.powerInstantaneousProducedElectricityl3.set(this.lastData.power.instantaneousProducedElectricityL3);
            }
        });

        // Gas
        this.metrics.gasTotalConsumed = new this.promClient.Gauge({
            name: "p1_gas_total_consumed",
            help: "The total gas consumed in m3",
            collect: () => {
                this.metrics.gasTotalConsumed.set(this.lastData.gas.totalConsumed);
            }
        });
    }

    calcTimestamp (timeString) {
        return new Date(2000 + parseInt(timeString.substr(0, 2), 10),
            parseInt(timeString.substr(2, 2), 10) - 1,
            parseInt(timeString.substr(4, 2), 10),
            parseInt(timeString.substr(6, 2), 10),
            parseInt(timeString.substr(8, 2), 10),
            parseInt(timeString.substr(10, 2), 10)).getTime() / 1000
    }

    parseTelegram(telegram) {
        let duration
        let events
        let fields
        let output = {power: {}, gas: {}}
        let timestamp
        let values

        for (let index = 0; index < telegram.length; index++) {
            if (/^\//.test(telegram[index])) {
                output.meterModel = /^\/(.*)/.exec(telegram[index])[1]
            }

            if (/^[^(]+\(/.test(telegram[index])) {
                switch (true) {
                    // 1-3:0.2.8(n) Version information for P1 out* put (DSMR 4.x/5.x)
                    case /1-3:0.2.8/.test(telegram[index]):
                        values = /^\d+-\d+:[^(]+\((\d+)\)/.exec(telegram[index])
                        if (values) {
                            output.dsmrVersion = parseInt(values[1], 10) / 10
                        }
                        continue

                    // 0-0:1.0.0(YYMMDDhhmmssX) Date-time stamp of the P1 message (X=S Summer time, X=W Winter time) ((DSMR 4.x/5.x))
                    case /0-0:1.0.0/.test(telegram[index]):
                        values = /^\d+-\d+:[^(]+\(([^)]+)\)/.exec(telegram[index])
                        if (values) {
                            output.timestamp = this.calcTimestamp(values[1])
                        }
                        continue

                    ////////////////////////////
                    // ELECTRICITY OBIS CODES //
                    ////////////////////////////
                    //
                    // 1-0:1.8.1(n*kWh) Total power consumed (tariff 1), accuracy: 0.001kWh (DSMR 2.x/3.0/4.x/5.x)
                    case /1-0:1.8.1/.test(telegram[index]):
                        values = /^\d+-\d+:[^(]+\((.*)\*kWh\)/.exec(telegram[index])
                        if (values) {
                            output.power.totalConsumed1 = parseFloat(values[1])
                        }
                        continue

                    // 1-0:1.8.2(n*kWh) Total power consumed (tariff 2), accuracy: 0.001kWh (DSMR 2.x/3.0/4.x/5.x)
                    case /1-0:1.8.2/.test(telegram[index]):
                        values = /^\d+-\d+:[^(]+\((.*)\*kWh\)/.exec(telegram[index])
                        if (values) {
                            output.power.totalConsumed2 = parseFloat(values[1])
                        }
                        continue

                    // 1-0:2.8.1(n*kWh) Total power produced (tariff 1), accuracy: 0.001kWh (DSMR 2.x/3.0/4.x/5.x)
                    case /1-0:2.8.1/.test(telegram[index]):
                        values = /^\d+-\d+:[^(]+\((.*)\*kWh\)/.exec(telegram[index])
                        if (values) {
                            output.power.totalProduced1 = parseFloat(values[1])
                        }
                        continue

                    // 1-0:2.8.2(n*kWh) Total power produced (tariff 2), accuracy: 0.001kWh (DSMR 2.x/3.0/4.x/5.x)
                    case /1-0:2.8.2/.test(telegram[index]):
                        values = /^\d+-\d+:[^(]+\((.*)\*kWh\)/.exec(telegram[index])
                        if (values) {
                            output.power.totalProduced2 = parseFloat(values[1])
                        }
                        continue

                    // 1-0:1.7.0(n*kW) Actual power consumed, resolution: 1 Watt (DSMR 2.x/3.0/4.x/5.x)
                    case /1-0:1.7.0/.test(telegram[index]):
                        values = /^\d+-\d+:[^(]+\((.*)\*kW\)/.exec(telegram[index])
                        if (values) {
                            output.power.actualConsumed = parseFloat(values[1])
                        }
                        continue

                    // 1-0:2.7.0(n*kW) Actual power produced (-P), resolution: 1 Watt (DSMR 3.0/4.x/5.x)
                    case /1-0:2.7.0/.test(telegram[index]):
                        values = /^\d+-\d+:[^(]+\((.*)\*kW\)/.exec(telegram[index])
                        if (values) {
                            output.power.actualProduced = parseFloat(values[1])
                        }
                        continue

                    // 0-0:17.0.0(n*A) The actual threshold Electricity in A (DSMR 2.2/2.3/3.0)
                    // 0-0:17.0.0(n*kW) The actual threshold Electricity in kW (DSMR 4.x)
                    case /0-0:17.0.0/.test(telegram[index]):
                        continue

                    // 0-0:96.14.0 Electricity tariff indicator (DSMR 2.x/3.0/4.x/5.x)
                    case /0-0:96.14.0/.test(telegram[index]):
                        values = /^\d+-\d+:[^(]+\((.*)\)/.exec(telegram[index])
                        if (values) {
                            output.power.activeTariff = parseInt(values[1], 10)
                        }
                        continue

                    // 1-0:99.97.0(2)(0-0:96.7.19)(YYMMDDhhssX)(n*s)(YYMMDDhhssX)(n*s) Power Failure Event Log (DSMR 4.x/5.x)
                    case /1-0:99.97.0/.test(telegram[index]):
                        output.power.failureLog = []

                        // Determine number of reported events
                        values = /^\d+-\d+:[^(]+\((.*)\)/.exec(telegram[index])
                        if (values) {
                            events = parseInt(values[1], 10)
                        }

                        events = /^\d+-\d+:[^(]+\([^)]+\)\([^)]+\)\((.*)\)/.exec(telegram[index])

                        if (events) {
                            fields = events[1].split(')(')

                            for (let field = 0; field < fields.length; field++) {
                                timestamp = this.calcTimestamp(fields[field])

                                values = /^(.*)\*s/.exec(fields[++field])
                                if (values) {
                                    duration = parseInt(values[1], 10)
                                }

                                output.power.failureLog.push({
                                    timestampEnd: timestamp,
                                    duration: duration
                                })
                            }
                        }
                        continue

                    // 1-0:32.32.0(n) Number of voltage sags in phase L1 (DSMR 4.x/5.x)
                    case /1-0:32.32.0/.test(telegram[index]):
                        values = /^\d+-\d+:[^(]+\((.*)/.exec(telegram[index])
                        if (values) {
                            output.power.voltageSagsL1 = parseInt(values[1], 10)
                        }
                        continue

                    // 1-0:32.36.0(n) Number of voltage swells in phase L1 (DSMR 4.x/5.x)
                    case /1-0:32.36.0/.test(telegram[index]):
                        values = /^\d+-\d+:[^(]+\((.*)/.exec(telegram[index])
                        if (values) {
                            output.power.voltageSwellsL1 = parseInt(values[1], 10)
                        }
                        continue

                    // 1-0:52.32.0(n) Number of voltage sags in phase L2 (DSMR 4.x/5.x)
                    case /1-0:52.32.0/.test(telegram[index]):
                        values = /^\d+-\d+:[^(]+\((.*)/.exec(telegram[index])
                        if (values) {
                            output.power.voltageSagsL2 = parseInt(values[1], 10)
                        }
                        continue

                    // 1-0:52.36.0(00000) Number of voltage swells in phase L2 (DSMR 4.x/5.x)
                    case /1-0:52.36.0/.test(telegram[index]):
                        values = /^\d+-\d+:[^(]+\((.*)/.exec(telegram[index])
                        if (values) {
                            output.power.voltageSwellsL2 = parseInt(values[1], 10)
                        }
                        continue

                    // 1-0:72.32.0(00000) Number of voltage sags in phase L3 (DSMR 4.x/5.x)
                    case /1-0:72.32.0/.test(telegram[index]):
                        values = /^\d+-\d+:[^(]+\((.*)/.exec(telegram[index])
                        if (values) {
                            output.power.voltageSagsL3 = parseInt(values[1], 10)
                        }
                        continue

                    // 1-0:72.36.0(00000) Number of voltage swells in phase L3 (DSMR 4.x/5.x)
                    case /1-0:72.36.0/.test(telegram[index]):
                        values = /^\d+-\d+:[^(]+\((.*)/.exec(telegram[index])
                        if (values) {
                            output.power.voltageSwellsL3 = parseInt(values[1], 10)
                        }
                        continue

                    // 1-0:32.7.0(n*V) Instantaneous voltage L1 in V (DSMR 4.x/5.x)
                    case /1-0:32.7.0/.test(telegram[index]):
                        values = /^\d+-\d+:[^(]+\((.*)/.exec(telegram[index])
                        if (values) {
                            output.power.instantaneousVoltageL1 = parseFloat(values[1])
                        }
                        continue

                    // 1-0:52.7.0(n*V) Instantaneous voltage L2 in V (DSMR 4.x/5.x)
                    case /1-0:52.7.0/.test(telegram[index]):
                        values = /^\d+-\d+:[^(]+\((.*)/.exec(telegram[index])
                        if (values) {
                            output.power.instantaneousVoltageL2 = parseFloat(values[1])
                        }
                        continue

                    // 1-0:72.7.0(n*V) Instantaneous voltage L3 in V (DSMR 4.x/5.x)
                    case /1-0:72.7.0/.test(telegram[index]):
                        values = /^\d+-\d+:[^(]+\((.*)/.exec(telegram[index])
                        if (values) {
                            output.power.instantaneousVoltageL3 = parseFloat(values[1])
                        }
                        continue

                    // 1-0:31.7.0(n*A) Instantaneous current L1 in A (DSMR 4.x/5.x)
                    case /1-0:31.7.0/.test(telegram[index]):
                        values = /^\d+-\d+:[^(]+\((.*)/.exec(telegram[index])
                        if (values) {
                            output.power.instantaneousCurrentL1 = parseFloat(values[1])
                        }
                        continue

                    // 1-0:51.7.0(n*A) Instantaneous current L2 in A (DSMR 4.x/5.x)
                    case /1-0:51.7.0/.test(telegram[index]):
                        values = /^\d+-\d+:[^(]+\((.*)/.exec(telegram[index])
                        if (values) {
                            output.power.instantaneousCurrentL2 = parseFloat(values[1])
                        }
                        continue

                    // 1-0:71.7.0(n*A) Instantaneous current L3 in A (DSMR 4.x/5.x)
                    case /1-0:71.7.0/.test(telegram[index]):
                        values = /^\d+-\d+:[^(]+\((.*)/.exec(telegram[index])
                        if (values) {
                            output.power.instantaneousCurrentL3 = parseFloat(values[1])
                        }
                        continue

                    // 1-0:21.7.0(n*kW) Instantaneous active power L1 (+P) in kW (DSMR 4.x/5.x)
                    case /1-0:21.7.0/.test(telegram[index]):
                        values = /^\d+-\d+:[^(]+\((.*)\*kW\)/.exec(telegram[index])
                        if (values) {
                            output.power.instantaneousConsumedElectricityL1 = parseFloat(values[1])
                        }
                        continue

                    // 1-0:22.7.0(n*kW) Instantaneous active power L1 (-P) in kW (DSMR 4.x/5.x)
                    case /1-0:22.7.0/.test(telegram[index]):
                        values = /^\d+-\d+:[^(]+\((.*)\*kW\)/.exec(telegram[index])
                        if (values) {
                            output.power.instantaneousProducedElectricityL1 = parseFloat(values[1])
                        }
                        continue

                    // 1-0:41.7.0(n*kW) Instantaneous active power L2 (+P) in kW (DSMR 4.x/5.x)
                    case /1-0:41.7.0/.test(telegram[index]):
                        values = /^\d+-\d+:[^(]+\((.*)\*kW\)/.exec(telegram[index])
                        if (values) {
                            output.power.instantaneousConsumedElectricityL2 = parseFloat(values[1])
                        }
                        continue

                    // 1-0:42.7.0(n*kW) Instantaneous active power L2 (-P) in kW (DSMR 4.x/5.x)
                    case /1-0:42.7.0/.test(telegram[index]):
                        values = /^\d+-\d+:[^(]+\((.*)\*kW\)/.exec(telegram[index])
                        if (values) {
                            output.power.instantaneousProducedElectricityL2 = parseFloat(values[1])
                        }
                        continue

                    // 1-0:61.7.0(n*kW) Instantaneous active power L3 (+P) in kW (DSMR 4.x/5.x)
                    case /1-0:61.7.0/.test(telegram[index]):
                        values = /^\d+-\d+:[^(]+\((.*)\*kW\)/.exec(telegram[index])
                        if (values) {
                            output.power.instantaneousConsumedElectricityL3 = parseFloat(values[1])
                        }
                        continue

                    // 1-0:62.7.0(n*kW) Instantaneous active power L3 (-P) in kW (DSMR 4.x/5.x)
                    case /1-0:62.7.0/.test(telegram[index]):
                        values = /^\d+-\d+:[^(]+\((.*)\*kW\)/.exec(telegram[index])
                        if (values) {
                            output.power.instantaneousProducedElectricityL3 = parseFloat(values[1])
                        }
                        continue

                    // 0-0:42.0.0(n) Equipment identifier power (DSMR 2.x)
                    // 0-0:96.1.1(n) Equipment identifier Electricity (DSMR 3.0/4.x/5.x)
                    case /0-0:42.0.0/.test(telegram[index]):
                    case /0-0:96.1.1/.test(telegram[index]):
                        values = /^\d+-\d+:[^(]+\((.*)\)/.exec(telegram[index])
                        if (values) {
                            output.power.equipmentId = Buffer.from(values[1], 'hex').toString()
                        }
                        continue

                    // 0-0:96.7.9(n) Number of long power failures in any phase (DSMR 4.x/5.x)
                    case /0-0:96.7.9/.test(telegram[index]):
                        values = /^\d+-\d+:[^(]+\((.*)\)/.exec(telegram[index])
                        if (values) {
                            output.power.failuresLong = parseInt(values[1], 10)
                        }
                        continue

                    // 0-0:96.7.21(n) Number of power failures in any phases (DSMR 4.x/5.x)
                    case /0-0:96.7.21/.test(telegram[index]):
                        values = /^\d+-\d+:[^(]+\((.*)\)/.exec(telegram[index])
                        if (values) {
                            output.power.failures = parseInt(values[1], 10)
                        }
                        continue

                    // 1-0:96.3.10(n) Actual switch position Electricity (in/out) (DSMR 2.1)
                    // 0-0:24.4.0(n) Actual switch position Electricity (in/off) (DSMR 2.2/2.3)
                    // 0-0:96.3.10(n) Actual switch position Electricity (in/out/enabled) (DSMR 3.0/4.x)
                    case /1-0:96.3.10/.test(telegram[index]):
                    case /0-0:24.4.0/.test(telegram[index]):
                    case /0-0:96.3.10/.test(telegram[index]):
                        values = /^\d+-\d+:[^(]+\((.*)\)/.exec(telegram[index])
                        if (values) {
                            output.power.switchPosition = parseInt(values[1], 10)
                        }
                        continue

                    ////////////////////
                    // GAS OBIS CODES //
                    ////////////////////
                    //
                    // 0-n:24.1.0(n) Device-Type (DSMR 3.0/4.x./5.x)
                    case /0-[1-9]+:24.1.0/.test(telegram[index]):
                        continue

                    // 7-0:0.0.0(n)  Equipment identifier (gas meter) (DSMR 2.x)
                    // 0-n:96.1.0(n) Equipment identifier (gas meter) (DSMR 3.0/4.x/5.x)
                    case /7-0:0.0.0/.test(telegram[index]):
                    case /0-[1-9]+:96.1.0/.test(telegram[index]):
                        values = /^\d+-\d+:[^(]+\((.*)\)/.exec(telegram[index])
                        if (values) {
                            output.gas.equipmentId = Buffer.from(values[1], 'hex').toString()
                        }
                        continue

                    // 24.3.0(YYMMDDhhmmss)(00)(60)(1)(0-2:24.2.1)(m3) Consumed gas over the last hour in m3 (DSMR 3.0)
                    case /0-[1-9]+:24.3.0/.test(telegram[index]):
                        // Calculate timestamp
                        values = /^\d+-\d+:[^(]+\(([^)]+)\)/.exec(telegram[index])
                        if (values) {
                            output.gas.timestamp = this.calcTimestamp(values[[1]])
                        }

                        // Get usage value from next line
                        values = /^\(([^)]+)/.exec(telegram[index + 1])
                        if (values) {
                            output.gas.totalConsumed = parseFloat(values[1])
                            output.gas.reportedPeriod = 60
                        }
                        continue

                    // 7-0:23.1.0(YYMMhhmmss)(n) Consumed gas over the last 24 hours in 0.001m3 (DSMR 2.x)
                    // 7-0:23.2.0(YYMMhhmmss)(n) Consumed gas over the last 24 hours in 0.001m3, temperature compensated (DSMR 2.x)
                    case /7-0:23.1.0/.test(telegram[index]):
                    case /7-0:23.2.0/.test(telegram[index]):
                        values = /^\d+-\d+:[^(]+\((.*)\)\((.*)\)/.exec(telegram[index])
                        if (values) {
                            output.gas.timestamp = this.calcTimestamp(values[1])

                            output.gas.totalConsumed = parseFloat(values[2])
                            output.gas.reportedPeriod = 1440
                        }
                        continue

                    // 0-n:24.2.1(YYMMDDhhmmssX)(n*m3) Consumed gas over the last hour in m3 (DSMR 4.x)
                    // 0-n:24.2.1(YYMMDDhhmmssX)(n*m3) Consumed gas over the last 5 minutes in m3 (DSMR 5.x)
                    case /0-[1-9]+:24.2.1/.test(telegram[index]):
                        values = /^\d+-\d+:[^(]+\((.*)\)\((.*)\)/.exec(telegram[index])
                        if (values) {
                            output.gas.timestamp = this.calcTimestamp(values[1])

                            // The reported period will be added when the whole telegram has been processed
                            // because only then its known if this is a 4.x or 5.x version report
                            output.gas.totalConsumed = parseFloat(values[2])
                        }
                        continue

                    // 7-0:96.3.10(n) Valve position gas (on/off/released) (DSMR 2.1)
                    // 7-0:24.4.0(n) Valve position gas (on/off/released) (DSMR 2.2/2.3)
                    // 0-n:24.4.0(n)  Valve position gas (on/off/released) (DSMR 3.0/4.x)
                    case /7-0:96.3.10/.test(telegram[index]):
                    case /7-0:24.4.0/.test(telegram[index]):
                    case /0-[1-9]+:24.4.0/.test(telegram[index]):
                        values = /^\d+-\d+:[^(]+\((.*)\)/.exec(telegram[index])
                        if (values) {
                            output.gas.valvePosition = parseInt(values[1], 10)
                        }
                        continue

                    /////////////////////////
                    // MESSAGES OBIS CODES //
                    /////////////////////////
                    //
                    // 0-0:96.13.0(s) Text message max 1024 characters (DSMR 2.x/3.0/4.x/5.x)
                    case /0-0:96.13.0/.test(telegram[index]):
                        continue

                    // 0-0:96.13.1(n) Text message codes: numeric 8 digits (DSMR 2.x/3.0/4.x/5.x)
                    case /0-0:96.13.1/.test(telegram[index]):
                        continue

                    default:
                        logger.debug('Unknown id: ' + telegram[index])
                }
            }
        }

        // Set the reporting period in minutes for DSMR 4.x or 5.x
        if (output.gas.totalConsumed !== undefined && output.dsmrVersion < 5) {
            output.gas.reportedPeriod = 60
        }

        if (output.gas.totalConsumed !== undefined && output.dsmrVersion >= 5) {
            output.gas.reportedPeriod = 5
        }

        return output
    }
}

new MetricsManager();
