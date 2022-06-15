
import { Measurement, PowerAttributes } from "./types.js";
import * as cc  from 'currency-codes';

function enumsByValue(_enum) {
    let ret = {};
    for (let key in _enum) {
        ret[_enum[key]] = key;
    }
    return ret;
}

export enum REPORT_NAME {
    METADATA_HISTORY_USAGE = "METADATA_HISTORY_USAGE",
    HISTORY_USAGE = "HISTORY_USAGE",
    METADATA_HISTORY_GREENBUTTON = "METADATA_HISTORY_GREENBUTTON",
    HISTORY_GREENBUTTON = "HISTORY_GREENBUTTON",
    METADATA_TELEMETRY_USAGE = "METADATA_TELEMETRY_USAGE",
    TELEMETRY_USAGE = "TELEMETRY_USAGE",
    METADATA_TELEMETRY_STATUS = "METADATA_TELEMETRY_STATUS",
    TELEMETRY_STATUS = "TELEMETRY_STATUS"
};

export const REPORT_NAME_BY_VALUE = enumsByValue(REPORT_NAME);

export function isReportName(report_name: string): boolean {
    if (!report_name) return true;
    if (!(typeof report_name === 'string')) return false;
    if ((report_name in REPORT_NAME)
     || (report_name in REPORT_NAME_BY_VALUE)) {
        return true;
    }
    if ((report_name.indexOf('x-') === 0)
     || (report_name.indexOf('X-') === 0)) {
        return true;
    }
    return false;
}

export enum REPORT_TYPE {
    READING = "reading",
    USAGE = "usage",
    DEMAND = "demand",
    SET_POINT = "setPoint",
    DELTA_USAGE = "deltaUsage",
    DELTA_SET_POINT = "deltaSetPoint",
    DELTA_DEMAND = "deltaDemand",
    BASELINE = "baseline",
    DEVIATION = "deviation",
    AVG_USAGE = "avgUsage",
    AVG_DEMAND = "avgDemand",
    OPERATING_STATE = "operatingState",
    UP_REGULATION_CAPACITY_AVAILABLE = "upRegulationCapacityAvailable",
    DOWN_REGULATION_CAPACITY_AVAILABLE = "downRegulationCapacityAvailable",
    REGULATION_SETPOINT = "regulationSetpoint",
    STORED_ENERGY = "storedEnergy",
    TARGET_ENERGY_STORAGE = "targetEnergyStorage",
    AVAILABLE_ENERGY_STORAGE = "availableEnergyStorage",
    PRICE = "price",
    LEVEL = "level",
    POWER_FACTOR = "powerFactor",
    PERCENT_USAGE = "percentUsage",
    PERCENT_DEMAND = "percentDemand",
    X_RESOURCE_STATUS = "x-resourceStatus"
};

export const REPORT_TYPES_BY_VALUE = enumsByValue(REPORT_TYPE);

export function isReportType(report_type: string): boolean {
    if (!report_type) return true;
    if (!(typeof report_type === 'string')) return false;
    if ((report_type in REPORT_TYPE)
     || (report_type in REPORT_TYPES_BY_VALUE)) {
        return true;
    }
    if ((report_type.indexOf('x-') === 0)
     || (report_type.indexOf('X-') === 0)) {
        return true;
    }
    return false;
}


export enum READING_TYPE {
    DIRECT_READ = "Direct Read",
    NET = "Net",
    ALLOCATED = "Allocated",
    ESTIMATED = "Estimated",
    SUMMED = "Summed",
    DERIVED = "Derived",
    MEAN = "Mean",
    PEAK = "Peak",
    HYBRID = "Hybrid",
    CONTRACT = "Contract",
    PROJECTED = "Projected",
    X_RMS = "x-RMS",
    X_NOT_APPLICABLE = "x-notApplicable",
};

export const READING_TYPE_BY_VALUE = enumsByValue(READING_TYPE);

export function isReadingType(reading_type: string): boolean {
    if (!reading_type) return true;
    if (!(typeof reading_type === 'string')) return false;
    if ((reading_type in READING_TYPE)
     || (reading_type in READING_TYPE_BY_VALUE)) {
        return true;
    }
    if ((reading_type.indexOf('x-') === 0)
     || (reading_type.indexOf('X-') === 0)) {
        return true;
    }
    return false;
}

export enum HERTZ {
    HZ_50 = 50,
    HZ_60 = 60
};

export const HERTZ_BY_VALUE = enumsByValue(HERTZ);

export function isHertz(hertz: string | number): boolean {
    if (!hertz) return true;
    if (typeof hertz !== 'string' && typeof hertz !== 'number') return false;
    if (typeof hertz === 'number' && !Number.isInteger(hertz)) return false;
    if (typeof hertz === 'string'
     && (hertz in HERTZ)
     || (hertz in HERTZ_BY_VALUE)) {
        return true;
    }
    return false;
}


export enum SI_SCALE_CODE {
    p = "p",
    n = "n",
    micro = "micro",
    m = "m",
    c = "c",
    d = "d",
    k = "k",
    M = "M",
    G = "G",
    T = "T",
    none = "none"
};

export const SI_SCALE_CODE_BY_VALUE = enumsByValue(HERTZ);

export function isSIScaleCode(scale_code: string | number): boolean {
    if (!scale_code) return true;
    if (typeof scale_code !== 'string') return false;
    if (typeof scale_code === 'string'
     && (scale_code in SI_SCALE_CODE)
     || (scale_code in SI_SCALE_CODE_BY_VALUE)) {
        return true;
    }
    if ((scale_code.indexOf('x-') === 0)
     || (scale_code.indexOf('X-') === 0)) {
        return true;
    }
    return false;
}


export const _CURRENCIES = cc.codes();

export const _ACCEPTABLE_UNITS = {
    'currency': _CURRENCIES,
    'currencyPerKW': _CURRENCIES,
    'currencyPerKWh': _CURRENCIES,
    'currencyPerThm': _CURRENCIES,
    'current': [ 'A' ],
    'energyApparent': [ 'VAh' ],
    'energyReactive': [ 'VARh' ],
    'energyReal': [ 'Wh' ],
    'frequency': [ 'Hz' ],
    'powerApparent': [ 'VA' ],
    'powerReactive': [ 'VAR' ],
    'powerReal': [ 'W' ],
    'pulseCount': [ 'count' ],
    'temperature': [ 'celsius', 'fahrenheit' ],
    'Therm': [ 'thm' ],
    'voltage': [ 'V' ]
};

export const _MEASUREMENT_DESCRIPTIONS = {
    'currency': 'currency',
    'currencyPerKW': 'currencyPerKW',
    'currencyPerKWh': 'currencyPerKWh',
    'currencyPerThm': 'currency',
    'current': 'Current',
    'energyApparent': 'ApparentEnergy',
    'energyReactive': 'ReactiveEnergy',
    'energyReal': 'RealEnergy',
    'frequency': 'Frequency',
    'powerApparent': 'ApparentPower',
    'powerReactive': 'ReactivePower',
    'powerReal': 'RealPower',
    'pulseCount': 'pulse count',
    'temperature': 'temperature',
    'Therm': 'Therm',
    'voltage': 'Voltage'
};

export const MEASUREMENTS = {
    VOLTAGE: new Measurement('voltage',
        _MEASUREMENT_DESCRIPTIONS['voltage'],
        _ACCEPTABLE_UNITS['voltage'][0],
        _ACCEPTABLE_UNITS['voltage'],
        'none'),
    CURRENT: new Measurement('current',
        _MEASUREMENT_DESCRIPTIONS['current'],
        _ACCEPTABLE_UNITS['current'][0],
        _ACCEPTABLE_UNITS['current'],
        'none'),
    ENERGY_REAL: new Measurement('energyReal',
        _MEASUREMENT_DESCRIPTIONS['energyReal'],
        _ACCEPTABLE_UNITS['energyReal'][0],
        _ACCEPTABLE_UNITS['energyReal'],
        'none'),
    REAL_ENERGY: new Measurement('energyReal',
        _MEASUREMENT_DESCRIPTIONS['energyReal'],
        _ACCEPTABLE_UNITS['energyReal'][0],
        _ACCEPTABLE_UNITS['energyReal'],
        'none'),
    ACTIVE_ENERGY: new Measurement('energyReal',
        _MEASUREMENT_DESCRIPTIONS['energyReal'],
        _ACCEPTABLE_UNITS['energyReal'][0],
        _ACCEPTABLE_UNITS['energyReal'],
        'none'),
    ENERGY_REACTIVE: new Measurement('energyReactive',
        _MEASUREMENT_DESCRIPTIONS['energyReactive'],
        _ACCEPTABLE_UNITS['energyReactive'][0],
        _ACCEPTABLE_UNITS['energyReactive'],
        'none'),
    REACTIVE_ENERGY: new Measurement('energyReactive',
        _MEASUREMENT_DESCRIPTIONS['energyReactive'],
        _ACCEPTABLE_UNITS['energyReactive'][0],
        _ACCEPTABLE_UNITS['energyReactive'],
        'none'),
    ENERGY_APPARENT: new Measurement('energyApparent',
        _MEASUREMENT_DESCRIPTIONS['energyApparent'],
        _ACCEPTABLE_UNITS['energyApparent'][0],
        _ACCEPTABLE_UNITS['energyApparent'],
        'none'),
    APPARENT_ENERGY: new Measurement('energyApparent',
        _MEASUREMENT_DESCRIPTIONS['energyApparent'],
        _ACCEPTABLE_UNITS['energyApparent'][0],
        _ACCEPTABLE_UNITS['energyApparent'],
        'none'),
    ACTIVE_POWER: new Measurement('powerReal',
        _MEASUREMENT_DESCRIPTIONS['powerReal'],
        _ACCEPTABLE_UNITS['powerReal'][0],
        _ACCEPTABLE_UNITS['powerReal'],
        'none',
        new PowerAttributes(50, 230, true)),
    REAL_POWER: new Measurement('powerReal',
        _MEASUREMENT_DESCRIPTIONS['powerReal'],
        _ACCEPTABLE_UNITS['powerReal'][0],
        _ACCEPTABLE_UNITS['powerReal'],
        'none',
        new PowerAttributes(50, 230, true)),
    POWER_REAL: new Measurement('powerReal',
        _MEASUREMENT_DESCRIPTIONS['powerReal'],
        _ACCEPTABLE_UNITS['powerReal'][0],
        _ACCEPTABLE_UNITS['powerReal'],
        'none',
        new PowerAttributes(50, 230, true)),
    REACTIVE_POWER: new Measurement('powerReactive',
        _MEASUREMENT_DESCRIPTIONS['powerReactive'],
        _ACCEPTABLE_UNITS['powerReactive'][0],
        _ACCEPTABLE_UNITS['powerReactive'],
        'none',
        new PowerAttributes(50, 230, true)),
    POWER_REACTIVE: new Measurement('powerReactive',
        _MEASUREMENT_DESCRIPTIONS['powerReactive'],
        _ACCEPTABLE_UNITS['powerReactive'][0],
        _ACCEPTABLE_UNITS['powerReactive'],
        'none',
        new PowerAttributes(50, 230, true)),
    APPARENT_POWER: new Measurement('powerApparent',
        _MEASUREMENT_DESCRIPTIONS['powerApparent'],
        _ACCEPTABLE_UNITS['powerApparent'][0],
        _ACCEPTABLE_UNITS['powerApparent'],
        'none',
        new PowerAttributes(50, 230, true)),
    POWER_APPARENT: new Measurement('powerApparent',
        _MEASUREMENT_DESCRIPTIONS['powerApparent'],
        _ACCEPTABLE_UNITS['powerApparent'][0],
        _ACCEPTABLE_UNITS['powerApparent'],
        'none',
        new PowerAttributes(50, 230, true)),
    FREQUENCY: new Measurement('frequency',
        _MEASUREMENT_DESCRIPTIONS['frequency'],
        _ACCEPTABLE_UNITS['frequency'][0],
        _ACCEPTABLE_UNITS['frequency'],
        'none'),
    PULSE_COUNT: new Measurement('pulseCount',
        _MEASUREMENT_DESCRIPTIONS['pulseCount'],
        _ACCEPTABLE_UNITS['pulseCount'][0],
        _ACCEPTABLE_UNITS['pulseCount'],
        undefined,
        undefined,
        1000),
    TEMPERATURE: new Measurement('temperature',
        _MEASUREMENT_DESCRIPTIONS['temperature'],
        _ACCEPTABLE_UNITS['temperature'][0],
        _ACCEPTABLE_UNITS['temperature'],
        'none'),
    THERM: new Measurement('Therm',
        _MEASUREMENT_DESCRIPTIONS['Therm'],
        _ACCEPTABLE_UNITS['Therm'][0],
        _ACCEPTABLE_UNITS['Therm'],
        'none'),
    CURRENCY: new Measurement('currency',
        _MEASUREMENT_DESCRIPTIONS['currency'],
        _CURRENCIES[0],
        _CURRENCIES,
        'none'),
    CURRENCY_PER_KW: new Measurement('currencyPerKW',
        _MEASUREMENT_DESCRIPTIONS['currencyPerKW'],
        _CURRENCIES[0],
        _CURRENCIES,
        'none'),
    CURRENCY_PER_KWH: new Measurement('currencyPerKWh',
        _MEASUREMENT_DESCRIPTIONS['currencyPerKWh'],
        _CURRENCIES[0],
        _CURRENCIES,
        'none'),
    CURRENCY_PER_THM: new Measurement('currencyPerThm',
        _MEASUREMENT_DESCRIPTIONS['currencyPerThm'],
        _CURRENCIES[0],
        _CURRENCIES,
        'none')
};
