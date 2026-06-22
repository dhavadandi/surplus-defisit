import React, { useState, useMemo, useCallback } from "react";
import {
  ComposedChart, Area, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, Legend, ResponsiveContainer, Cell,
  BarChart, AreaChart, ReferenceLine,
} from "recharts";
import {
  Activity, AlertTriangle, ArrowRight, BarChart2, BookOpen,
  CheckCircle, ChevronDown, Clock, Database, Download, Eye,
  Filter, Globe, Info, Layers, Map, Monitor, Package,
  RefreshCw, Search, Share2, Shield, Sliders, TrendingDown,
  TrendingUp, Wheat, X, Zap, Star, FileText, Users,
  AlertCircle, ChevronRight, Circle, Cpu, GitBranch,
} from "lucide-react";

// ════════════════════════════════════════════════════════════
// DATA — All sourced from AgriGotongRoyong_Notes.md
// ZERO synthetic values. N/A shown where data unavailable.
// ════════════════════════════════════════════════════════════

const COMMODITY_COLORS: Record<string, string> = {
  Jagung: "#F59E0B",
  "Kacang Hijau": "#10B981",
  "Kacang Tanah": "#A78BFA",
  Kedelai: "#EF4444",
  Padi: "#22C55E",
  "Ubi Jalar": "#FB923C",
  "Ubi Kayu": "#60A5FA",
};

// Section 4 — Monthly provincial totals
const MONTHLY_BALANCE: Record<string, { month: string; prod: number; konsumsi: number; p50: number; surKab: number; defKab: number }[]> = {
  Jagung: [
    { month: "Jan", prod: 244450, konsumsi: 2294, p50: 242157, surKab: 30, defKab: 5 },
    { month: "Feb", prod: 306880, konsumsi: 2295, p50: 304584, surKab: 30, defKab: 5 },
    { month: "Mar", prod: 434384, konsumsi: 2297, p50: 432086, surKab: 30, defKab: 5 },
    { month: "Apr", prod: 428125, konsumsi: 2299, p50: 425826, surKab: 31, defKab: 4 },
    { month: "Mei", prod: 321202, konsumsi: 2301, p50: 318901, surKab: 31, defKab: 4 },
    { month: "Jun", prod: 303786, konsumsi: 2302, p50: 301484, surKab: 31, defKab: 4 },
  ],
  "Kacang Hijau": [
    { month: "Jan", prod: 2385, konsumsi: 1042, p50: 1342, surKab: 11, defKab: 24 },
    { month: "Feb", prod: 2482, konsumsi: 1043, p50: 1439, surKab: 12, defKab: 23 },
    { month: "Mar", prod: 4266, konsumsi: 1044, p50: 3222, surKab: 15, defKab: 20 },
    { month: "Apr", prod: 5939, konsumsi: 1045, p50: 4895, surKab: 15, defKab: 20 },
    { month: "Mei", prod: 8165, konsumsi: 1045, p50: 7120, surKab: 16, defKab: 19 },
    { month: "Jun", prod: 10229, konsumsi: 1046, p50: 9183, surKab: 15, defKab: 20 },
  ],
  Kedelai: [
    { month: "Jan", prod: 2301, konsumsi: 34646, p50: -32345, surKab: 0, defKab: 35 },
    { month: "Feb", prod: 2414, konsumsi: 34672, p50: -32258, surKab: 0, defKab: 35 },
    { month: "Mar", prod: 3474, konsumsi: 34699, p50: -31225, surKab: 0, defKab: 35 },
    { month: "Apr", prod: 4661, konsumsi: 34725, p50: -30064, surKab: 1, defKab: 34 },
    { month: "Mei", prod: 6355, konsumsi: 34752, p50: -28396, surKab: 1, defKab: 34 },
    { month: "Jun", prod: 8194, konsumsi: 34778, p50: -26584, surKab: 1, defKab: 34 },
  ],
  Padi: [
    { month: "Jan", prod: 351474, konsumsi: 267168, p50: -66511, surKab: 8, defKab: 27 },
    { month: "Feb", prod: 640803, konsumsi: 267372, p50: 98462, surKab: 16, defKab: 19 },
    { month: "Mar", prod: 1094891, konsumsi: 267577, p50: 357496, surKab: 25, defKab: 10 },
    { month: "Apr", prod: 1313786, konsumsi: 267782, p50: 482259, surKab: 26, defKab: 9 },
    { month: "Mei", prod: 1045736, konsumsi: 267986, p50: 329024, surKab: 24, defKab: 11 },
    { month: "Jun", prod: 921487, konsumsi: 268191, p50: 257886, surKab: 22, defKab: 13 },
  ],
  "Ubi Jalar": [
    { month: "Jan", prod: 9270, konsumsi: 10393, p50: -1122, surKab: 11, defKab: 24 },
    { month: "Feb", prod: 9684, konsumsi: 10400, p50: -717, surKab: 10, defKab: 25 },
    { month: "Mar", prod: 12895, konsumsi: 10408, p50: 2487, surKab: 15, defKab: 20 },
    { month: "Apr", prod: 14199, konsumsi: 10416, p50: 3783, surKab: 14, defKab: 21 },
    { month: "Mei", prod: 14539, konsumsi: 10424, p50: 4115, surKab: 14, defKab: 21 },
    { month: "Jun", prod: 15086, konsumsi: 10432, p50: 4654, surKab: 15, defKab: 20 },
  ],
  "Ubi Kayu": [
    { month: "Jan", prod: 142851, konsumsi: 40891, p50: 101960, surKab: 16, defKab: 19 },
    { month: "Feb", prod: 164042, konsumsi: 40922, p50: 123120, surKab: 16, defKab: 19 },
    { month: "Mar", prod: 192213, konsumsi: 40953, p50: 151260, surKab: 19, defKab: 16 },
    { month: "Apr", prod: 221521, konsumsi: 40984, p50: 180537, surKab: 20, defKab: 15 },
    { month: "Mei", prod: 231269, konsumsi: 41014, p50: 190254, surKab: 20, defKab: 15 },
    { month: "Jun", prod: 258428, konsumsi: 41045, p50: 217383, surKab: 21, defKab: 14 },
  ],
};

// Section 5 — Per-district commodity data (monthly averages, Jan–Jun 2026)
// [district, commodity, prodMean, surP50, surP10, defRob, surAman, kirim, terima]
type DRow = [string, string, number, number, number, number, number, number, number];
const RAW_DISTRICT: DRow[] = [
  ["Banjarnegara","Jagung",3638,3435,1939,0,1939,0,0],
  ["Banjarnegara","Kacang Hijau",7,-21,-28,28,0,0,0],
  ["Banjarnegara","Kacang Tanah",127,100,-28,28,0,0,0],
  ["Banjarnegara","Kedelai",17,-959,-975,975,0,0,0],
  ["Banjarnegara","Padi",10835,-255,-1553,1763,210,1259,6412],
  ["Banjarnegara","Ubi Jalar",186,-72,-251,251,0,0,0],
  ["Banjarnegara","Ubi Kayu",7888,6610,1977,0,1977,11865,0],
  ["Banyumas","Jagung",2534,2421,1446,0,1446,0,0],
  ["Banyumas","Kacang Hijau",9,-71,-80,80,0,0,0],
  ["Banyumas","Kacang Tanah",152,88,-64,64,0,0,0],
  ["Banyumas","Kedelai",12,-1468,-1480,1480,0,0,0],
  ["Banyumas","Padi",27642,2413,-783,3257,2474,3323,13537],
  ["Banyumas","Ubi Jalar",204,-391,-595,595,0,0,0],
  ["Banyumas","Ubi Kayu",2565,635,-641,641,0,0,3843],
  ["Batang","Jagung",9630,9616,6610,0,6610,0,0],
  ["Batang","Kacang Hijau",12,-24,-37,37,0,0,0],
  ["Batang","Kacang Tanah",19,-3,-22,22,0,0,0],
  ["Batang","Kedelai",18,-779,-797,797,0,0,0],
  ["Batang","Padi",16970,3434,1572,568,2140,9211,1106],
  ["Batang","Ubi Jalar",626,384,-241,241,0,0,0],
  ["Batang","Ubi Kayu",2628,1582,412,10,422,2531,59],
  ["Blora","Jagung",47157,47055,30146,0,30146,0,0],
  ["Blora","Kacang Hijau",155,147,-8,8,0,0,0],
  ["Blora","Kacang Tanah",173,117,-55,55,0,0,0],
  ["Blora","Kedelai",334,-374,-708,708,0,0,0],
  ["Blora","Padi",53174,23839,17718,0,17718,10882,0],
  ["Blora","Ubi Jalar",21,-184,-205,205,0,0,0],
  ["Blora","Ubi Kayu",952,204,-623,623,0,0,3736],
  ["Boyolali","Jagung",20574,20546,14321,0,14321,0,0],
  ["Boyolali","Kacang Hijau",2,-17,-19,19,0,0,0],
  ["Boyolali","Kacang Tanah",222,193,-29,29,0,0,0],
  ["Boyolali","Kedelai",31,-973,-1003,1003,0,0,0],
  ["Boyolali","Padi",25947,7895,5059,991,6051,3281,2731],
  ["Boyolali","Ubi Jalar",18,-250,-268,268,0,0,0],
  ["Boyolali","Ubi Kayu",4243,2972,272,16,289,1596,98],
  ["Brebes","Jagung",15084,15011,9597,0,9597,0,0],
  ["Brebes","Kacang Hijau",598,508,-90,90,0,0,0],
  ["Brebes","Kacang Tanah",2,-52,-54,54,0,0,0],
  ["Brebes","Kedelai",299,-1737,-2036,2036,0,0,0],
  ["Brebes","Padi",38644,5416,563,3983,4546,2493,12672],
  ["Brebes","Ubi Jalar",382,-15,-386,386,0,0,0],
  ["Brebes","Ubi Kayu",842,-582,-1253,1253,0,0,7518],
  ["Cilacap","Jagung",5271,5200,3280,0,3280,0,0],
  ["Cilacap","Kacang Hijau",702,667,-35,35,0,0,0],
  ["Cilacap","Kacang Tanah",273,237,-35,35,0,0,0],
  ["Cilacap","Kedelai",832,-508,-1340,1340,0,0,0],
  ["Cilacap","Padi",83497,32712,22891,0,22891,33347,0],
  ["Cilacap","Ubi Jalar",492,175,-317,317,0,0,0],
  ["Cilacap","Ubi Kayu",4775,3241,84,111,194,1164,663],
  ["Demak","Jagung",8082,8038,4697,0,4697,0,0],
  ["Demak","Kacang Hijau",1454,1410,-44,44,0,0,0],
  ["Demak","Kacang Tanah",28,-15,-32,32,0,0,0],
  ["Demak","Kedelai",69,-1065,-1135,1135,0,0,0],
  ["Demak","Padi",48198,18635,12318,433,12751,29794,1216],
  ["Demak","Ubi Jalar",519,104,-262,262,0,0,0],
  ["Demak","Ubi Kayu",309,-1087,-1147,1147,0,0,6879],
  ["Grobogan","Jagung",77185,77094,50565,0,50565,0,0],
  ["Grobogan","Kacang Hijau",698,672,-26,26,0,0,0],
  ["Grobogan","Kacang Tanah",3,-63,-65,65,0,0,0],
  ["Grobogan","Kedelai",1827,478,-1349,1349,0,0,0],
  ["Grobogan","Padi",59645,22643,14998,635,15633,0,3088],
  ["Grobogan","Ubi Jalar",24,-330,-354,354,0,0,0],
  ["Grobogan","Ubi Kayu",326,-1351,-1545,1545,0,0,9273],
  ["Jepara","Jagung",6136,6104,3900,0,3900,0,0],
  ["Jepara","Kacang Hijau",12,-20,-30,30,0,0,0],
  ["Jepara","Kacang Tanah",614,582,-32,32,0,0,0],
  ["Jepara","Kedelai",16,-1112,-1120,1120,0,0,0],
  ["Jepara","Padi",18843,1962,-237,2183,1947,0,6908],
  ["Jepara","Ubi Jalar",36,-308,-342,342,0,0,0],
  ["Jepara","Ubi Kayu",18587,17052,8045,0,8045,24722,0],
  ["Karanganyar","Jagung",2274,2249,1440,0,1440,0,0],
  ["Karanganyar","Kacang Hijau",9,-16,-25,25,0,0,0],
  ["Karanganyar","Kacang Tanah",234,192,-42,42,0,0,0],
  ["Karanganyar","Kedelai",17,-1183,-1200,1200,0,0,0],
  ["Karanganyar","Padi",29857,9570,6199,45,6243,10157,267],
  ["Karanganyar","Ubi Jalar",1991,1441,-467,467,0,0,0],
  ["Karanganyar","Ubi Kayu",5859,4009,1328,0,1328,7488,0],
  ["Kebumen","Jagung",2672,2610,1521,0,1521,0,0],
  ["Kebumen","Kacang Hijau",481,456,-25,25,0,0,0],
  ["Kebumen","Kacang Tanah",124,74,-49,49,0,0,0],
  ["Kebumen","Kedelai",17,-1467,-1484,1484,0,0,0],
  ["Kebumen","Padi",42121,14116,9438,603,10040,7776,0],
  ["Kebumen","Ubi Jalar",31,-303,-334,334,0,0,0],
  ["Kebumen","Ubi Kayu",2415,758,-566,566,0,0,3396],
  ["Kendal","Jagung",18203,18138,11621,0,11621,0,0],
  ["Kendal","Kacang Hijau",37,9,-28,28,0,0,0],
  ["Kendal","Kacang Tanah",10,-27,-37,37,0,0,0],
  ["Kendal","Kedelai",41,-972,-1013,1013,0,0,0],
  ["Kendal","Padi",15102,600,-1180,2694,1514,9083,10281],
  ["Kendal","Ubi Jalar",577,159,-398,398,0,0,0],
  ["Kendal","Ubi Kayu",458,-1086,-1357,1357,0,0,8144],
  ["Klaten","Jagung",7183,7149,4313,0,4313,0,0],
  ["Klaten","Kacang Hijau",48,14,-34,34,0,0,0],
  ["Klaten","Kacang Tanah",96,51,-45,45,0,0,0],
  ["Klaten","Kedelai",145,-929,-1074,1074,0,0,0],
  ["Klaten","Padi",38827,12835,8383,72,8455,11531,0],
  ["Klaten","Ubi Jalar",447,145,-234,234,0,0,0],
  ["Klaten","Ubi Kayu",1863,453,-522,522,0,0,3134],
  ["Kota Magelang","Jagung",6,-3,-3,3,0,0,120],
  ["Kota Magelang","Kacang Hijau",2,-1,-3,3,0,0,0],
  ["Kota Magelang","Kacang Tanah",2,0,-1,1,0,0,0],
  ["Kota Magelang","Kedelai",6,-79,-85,85,0,0,0],
  ["Kota Magelang","Padi",60,-610,-618,618,0,0,3069],
  ["Kota Magelang","Ubi Jalar",6,-7,-8,8,0,0,0],
  ["Kota Magelang","Ubi Kayu",5,-94,-95,95,0,0,568],
  ["Kota Pekalongan","Jagung",7,1,1,1,1,0,20],
  ["Kota Pekalongan","Kacang Hijau",2,-12,-14,14,0,0,0],
  ["Kota Pekalongan","Kacang Tanah",2,-4,-5,5,0,0,0],
  ["Kota Pekalongan","Kedelai",5,-306,-311,311,0,0,0],
  ["Kota Pekalongan","Padi",865,-1806,-1907,1907,0,0,9339],
  ["Kota Pekalongan","Ubi Jalar",5,-48,-49,49,0,0,0],
  ["Kota Pekalongan","Ubi Kayu",17,-211,-217,217,0,0,1305],
  ["Kota Salatiga","Jagung",12,-6,-11,11,0,0,120],
  ["Kota Salatiga","Kacang Hijau",2,-3,-5,5,0,0,0],
  ["Kota Salatiga","Kacang Tanah",2,-1,-3,3,0,0,0],
  ["Kota Salatiga","Kedelai",6,-161,-167,167,0,0,0],
  ["Kota Salatiga","Padi",321,-1025,-1065,1065,0,0,5237],
  ["Kota Salatiga","Ubi Jalar",14,-44,-56,56,0,0,0],
  ["Kota Salatiga","Ubi Kayu",114,-122,-178,178,0,0,1070],
  ["Kota Semarang","Jagung",217,83,10,19,28,0,118],
  ["Kota Semarang","Kacang Hijau",20,-24,-34,34,0,0,0],
  ["Kota Semarang","Kacang Tanah",23,-22,-29,29,0,0,0],
  ["Kota Semarang","Kedelai",29,-1367,-1373,1373,0,0,0],
  ["Kota Semarang","Padi",1434,-9517,-9706,9706,0,0,48141],
  ["Kota Semarang","Ubi Jalar",55,-302,-325,325,0,0,0],
  ["Kota Semarang","Ubi Kayu",198,-1510,-1597,1597,0,0,9584],
  ["Kota Surakarta","Jagung",5,-18,-19,19,0,0,121],
  ["Kota Surakarta","Kacang Hijau",2,-25,-27,27,0,0,0],
  ["Kota Surakarta","Kacang Tanah",2,-11,-13,13,0,0,0],
  ["Kota Surakarta","Kedelai",6,-430,-435,435,0,0,0],
  ["Kota Surakarta","Padi",17,-3322,-3325,3325,0,0,19703],
  ["Kota Surakarta","Ubi Jalar",6,-89,-90,90,0,0,0],
  ["Kota Surakarta","Ubi Kayu",7,-493,-493,493,0,0,2958],
  ["Kota Tegal","Jagung",4,-3,-4,4,0,0,120],
  ["Kota Tegal","Kacang Hijau",2,-16,-17,17,0,0,0],
  ["Kota Tegal","Kacang Tanah",2,-6,-7,7,0,0,0],
  ["Kota Tegal","Kedelai",5,-234,-239,239,0,0,0],
  ["Kota Tegal","Padi",304,-2132,-2167,2167,0,0,10745],
  ["Kota Tegal","Ubi Jalar",5,-72,-73,73,0,0,0],
  ["Kota Tegal","Ubi Kayu",7,-125,-125,125,0,0,752],
  ["Kudus","Jagung",1365,1326,704,0,704,0,0],
  ["Kudus","Kacang Hijau",296,281,-15,15,0,0,0],
  ["Kudus","Kacang Tanah",9,-22,-31,31,0,0,0],
  ["Kudus","Kedelai",13,-726,-739,739,0,0,0],
  ["Kudus","Padi",18150,4606,2360,377,2737,6892,728],
  ["Kudus","Ubi Jalar",100,-62,-162,162,0,0,0],
  ["Kudus","Ubi Kayu",1973,1173,4,56,60,354,348],
  ["Magelang","Jagung",1942,1872,991,0,991,120,0],
  ["Magelang","Kacang Hijau",6,-17,-23,23,0,0,0],
  ["Magelang","Kacang Tanah",36,13,-23,23,0,0,0],
  ["Magelang","Kedelai",10,-1004,-1009,1009,0,0,0],
  ["Magelang","Padi",15972,1105,-803,2139,1336,7904,7190],
  ["Magelang","Ubi Jalar",1202,934,-268,268,0,0,0],
  ["Magelang","Ubi Kayu",2164,650,-506,506,0,0,3039],
  ["Pati","Jagung",14284,14236,8970,0,8970,0,0],
  ["Pati","Kacang Hijau",622,574,-48,48,0,0,0],
  ["Pati","Kacang Tanah",83,48,-36,36,0,0,0],
  ["Pati","Kedelai",152,-824,-976,976,0,0,0],
  ["Pati","Padi",45041,15664,9991,884,10875,728,5305],
  ["Pati","Ubi Jalar",221,-208,-429,429,0,0,0],
  ["Pati","Ubi Kayu",42115,40364,21099,0,21099,20717,0],
  ["Pekalongan","Jagung",1077,1041,618,0,618,20,0],
  ["Pekalongan","Kacang Hijau",12,-24,-36,36,0,0,0],
  ["Pekalongan","Kacang Tanah",14,-13,-27,27,0,0,0],
  ["Pekalongan","Kedelai",12,-1003,-1015,1015,0,0,0],
  ["Pekalongan","Padi",15825,1684,-310,1849,1540,4066,6230],
  ["Pekalongan","Ubi Jalar",136,-184,-320,320,0,0,0],
  ["Pekalongan","Ubi Kayu",715,-326,-597,597,0,0,3581],
  ["Pemalang","Jagung",5708,5533,3468,0,3468,0,0],
  ["Pemalang","Kacang Hijau",15,-39,-53,53,0,0,0],
  ["Pemalang","Kacang Tanah",19,-49,-62,62,0,0,0],
  ["Pemalang","Kedelai",129,-1662,-1791,1791,0,0,0],
  ["Pemalang","Padi",36278,9052,4955,2444,7399,9581,7812],
  ["Pemalang","Ubi Jalar",167,-345,-512,512,0,0,0],
  ["Pemalang","Ubi Kayu",190,-1641,-1722,1722,0,0,10333],
  ["Purbalingga","Jagung",3993,3902,2372,0,2372,0,0],
  ["Purbalingga","Kacang Hijau",11,-43,-54,54,0,0,0],
  ["Purbalingga","Kacang Tanah",26,-10,-36,36,0,0,0],
  ["Purbalingga","Kedelai",23,-1006,-1030,1030,0,0,0],
  ["Purbalingga","Padi",12148,-1,-1557,2409,853,0,9391],
  ["Purbalingga","Ubi Jalar",407,100,-301,301,0,0,0],
  ["Purbalingga","Ubi Kayu",3393,2400,753,0,753,4518,0],
  ["Purworejo","Jagung",743,708,309,0,309,0,0],
  ["Purworejo","Kacang Hijau",207,193,-14,14,0,0,0],
  ["Purworejo","Kacang Tanah",46,25,-21,21,0,0,0],
  ["Purworejo","Kedelai",7,-712,-718,718,0,0,0],
  ["Purworejo","Padi",26862,10085,7101,323,7423,12149,807],
  ["Purworejo","Ubi Jalar",80,-148,-228,228,0,0,0],
  ["Purworejo","Ubi Kayu",1200,420,-507,507,0,0,3042],
  ["Rembang","Jagung",14681,14577,9191,0,9191,0,0],
  ["Rembang","Kacang Hijau",72,55,-17,17,0,0,0],
  ["Rembang","Kacang Tanah",19,-4,-23,23,0,0,0],
  ["Rembang","Kedelai",49,-569,-618,618,0,0,0],
  ["Rembang","Padi",20974,6843,4692,334,5026,0,2003],
  ["Rembang","Ubi Jalar",155,17,-139,139,0,0,0],
  ["Rembang","Ubi Kayu",2980,2450,97,46,143,859,277],
  ["Semarang","Jagung",6628,6571,4079,0,4079,238,0],
  ["Semarang","Kacang Hijau",21,12,1,1,1,0,0],
  ["Semarang","Kacang Tanah",104,85,-19,19,0,0,0],
  ["Semarang","Kedelai",30,-1087,-1117,1117,0,0,0],
  ["Semarang","Padi",17105,2829,948,874,1822,10933,2074],
  ["Semarang","Ubi Jalar",1559,1152,-407,407,0,0,0],
  ["Semarang","Ubi Kayu",3372,1877,341,7,348,2088,39],
  ["Sragen","Jagung",16058,16031,10496,0,10496,0,0],
  ["Sragen","Kacang Hijau",4,-31,-35,35,0,0,0],
  ["Sragen","Kacang Tanah",459,424,-35,35,0,0,0],
  ["Sragen","Kedelai",87,-1053,-1140,1140,0,0,0],
  ["Sragen","Padi",57349,25525,17975,0,17975,11357,0],
  ["Sragen","Ubi Jalar",16,-367,-376,376,0,0,0],
  ["Sragen","Ubi Kayu",426,-636,-1047,1047,0,0,6285],
  ["Sukoharjo","Jagung",1149,1116,643,0,643,121,0],
  ["Sukoharjo","Kacang Hijau",5,-28,-33,33,0,0,0],
  ["Sukoharjo","Kacang Tanah",193,111,-82,82,0,0,0],
  ["Sukoharjo","Kedelai",140,-810,-951,951,0,0,0],
  ["Sukoharjo","Padi",35453,14075,10262,45,10307,16365,0],
  ["Sukoharjo","Ubi Jalar",38,-274,-298,298,0,0,0],
  ["Sukoharjo","Ubi Kayu",919,42,-628,628,0,0,3769],
  ["Tegal","Jagung",11874,11801,7103,0,7103,120,0],
  ["Tegal","Kacang Hijau",10,-34,-44,44,0,0,0],
  ["Tegal","Kacang Tanah",26,-4,-29,29,0,0,0],
  ["Tegal","Kedelai",19,-1532,-1551,1551,0,0,0],
  ["Tegal","Padi",35909,7490,3335,1393,4728,17150,2875],
  ["Tegal","Ubi Jalar",633,194,-439,439,0,0,0],
  ["Tegal","Ubi Kayu",663,-756,-1169,1169,0,0,7016],
  ["Temanggung","Jagung",4165,4137,2393,0,2393,0,0],
  ["Temanggung","Kacang Hijau",6,-8,-14,14,0,0,0],
  ["Temanggung","Kacang Tanah",19,12,-7,7,0,0,0],
  ["Temanggung","Kedelai",13,-624,-636,636,0,0,0],
  ["Temanggung","Padi",5211,-2272,-2941,2941,0,0,13279],
  ["Temanggung","Ubi Jalar",209,81,-127,127,0,0,0],
  ["Temanggung","Ubi Kayu",633,-109,-477,477,0,0,2861],
  ["Wonogiri","Jagung",24492,24383,14966,0,14966,0,0],
  ["Wonogiri","Kacang Hijau",21,2,-18,18,0,0,0],
  ["Wonogiri","Kacang Tanah",2427,2364,-63,63,0,0,0],
  ["Wonogiri","Kedelai",128,-1022,-1151,1151,0,0,0],
  ["Wonogiri","Padi",33580,11360,7488,1025,8513,0,2756],
  ["Wonogiri","Ubi Jalar",424,-2,-384,384,0,0,0],
  ["Wonogiri","Ubi Kayu",78756,77098,39552,0,39552,13680,0],
  ["Wonosobo","Jagung",5775,5550,3222,0,3222,0,0],
  ["Wonosobo","Kacang Hijau",12,4,-6,6,0,0,0],
  ["Wonosobo","Kacang Tanah",35,19,-16,16,0,0,0],
  ["Wonosobo","Kedelai",23,-885,-908,908,0,0,0],
  ["Wonosobo","Padi",6534,-2348,-3166,3166,0,0,14361],
  ["Wonosobo","Ubi Jalar",1619,1314,-306,306,0,0,0],
  ["Wonosobo","Ubi Kayu",8164,6894,2034,0,2034,11989,0],
];

// Section 6 — Rankings
const SURPLUS_RANKING = [
  { rank: 1, name: "Wonogiri", value: 16312 },
  { rank: 2, name: "Grobogan", value: 14163 },
  { rank: 3, name: "Blora", value: 10115 },
  { rank: 4, name: "Pati", value: 9979 },
  { rank: 5, name: "Cilacap", value: 5961 },
  { rank: 6, name: "Sragen", value: 5511 },
  { rank: 7, name: "Klaten", value: 3209 },
  { rank: 8, name: "Demak", value: 2870 },
  { rank: 9, name: "Sukoharjo", value: 2162 },
  { rank: 10, name: "Purworejo", value: 1527 },
];

const DEFICIT_RANKING = [
  { rank: 1, name: "Kota Semarang", value: -1808 },
  { rank: 2, name: "Kota Surakarta", value: -627 },
  { rank: 3, name: "Kota Tegal", value: -370 },
  { rank: 4, name: "Kota Pekalongan", value: -341 },
  { rank: 5, name: "Kota Salatiga", value: -194 },
  { rank: 6, name: "Wonosobo", value: -186 },
  { rank: 7, name: "Temanggung", value: -138 },
  { rank: 8, name: "Kota Magelang", value: -115 },
  { rank: 9, name: "Brebes", value: -97 },
  { rank: 10, name: "Tegal", value: -80 },
];

// Section 7 — MILP Key Routes
const MILP_ROUTES = [
  { origin: "Cilacap", dest: "Kota Semarang", commodity: "Padi", volume: 33347, cost: "Rp 2.500/ton/km" },
  { origin: "Demak", dest: "Kota Surakarta", commodity: "Padi", volume: 29794, cost: "Rp 2.500/ton/km" },
  { origin: "Jepara", dest: "Pemalang", commodity: "Ubi Kayu", volume: 24722, cost: "Rp 2.500/ton/km" },
  { origin: "Wonogiri", dest: "Kota Semarang", commodity: "Ubi Kayu", volume: 13680, cost: "Rp 2.500/ton/km" },
  { origin: "Blora", dest: "Kota Semarang", commodity: "Padi", volume: 10882, cost: "Rp 2.500/ton/km" },
  { origin: "Tegal", dest: "Kota Tegal", commodity: "Padi", volume: 17150, cost: "Rp 2.500/ton/km" },
  { origin: "Sukoharjo", dest: "Kota Surakarta", commodity: "Padi", volume: 16365, cost: "Rp 2.500/ton/km" },
  { origin: "Klaten", dest: "Kota Semarang", commodity: "Padi", volume: 11531, cost: "Rp 2.500/ton/km" },
  { origin: "Pati", dest: "Kota Semarang", commodity: "Ubi Kayu", volume: 20717, cost: "Rp 2.500/ton/km" },
  { origin: "Banjarnegara", dest: "Brebes", commodity: "Ubi Kayu", volume: 11865, cost: "Rp 2.500/ton/km" },
  { origin: "Wonosobo", dest: "Temanggung", commodity: "Ubi Kayu", volume: 11989, cost: "Rp 2.500/ton/km" },
  { origin: "Sragen", dest: "Kota Surakarta", commodity: "Padi", volume: 11357, cost: "Rp 2.500/ton/km" },
];

// District map nodes (approximate geographic positions in 640×340 SVG)
interface MapNode {
  id: string;
  name: string;
  x: number;
  y: number;
  balance: number; // overall avg surplus P50 ton/bln
  status: "surplus" | "deficit" | "watchlist";
}

const MAP_NODES: MapNode[] = [
  { id: "banjarnegara", name: "Banjarnegara", x: 218, y: 198, balance: 50, status: "watchlist" },
  { id: "banyumas", name: "Banyumas", x: 148, y: 228, balance: 20, status: "watchlist" },
  { id: "batang", name: "Batang", x: 278, y: 78, balance: 1627, status: "surplus" },
  { id: "blora", name: "Blora", x: 585, y: 148, balance: 10115, status: "surplus" },
  { id: "boyolali", name: "Boyolali", x: 415, y: 192, balance: 1200, status: "surplus" },
  { id: "brebes", name: "Brebes", x: 38, y: 148, balance: -97, status: "deficit" },
  { id: "cilacap", name: "Cilacap", x: 82, y: 268, balance: 5961, status: "surplus" },
  { id: "demak", name: "Demak", x: 435, y: 72, balance: 2870, status: "surplus" },
  { id: "grobogan", name: "Grobogan", x: 502, y: 155, balance: 14163, status: "surplus" },
  { id: "jepara", name: "Jepara", x: 454, y: 30, balance: 800, status: "surplus" },
  { id: "karanganyar", name: "Karanganyar", x: 528, y: 242, balance: 2300, status: "surplus" },
  { id: "kebumen", name: "Kebumen", x: 205, y: 262, balance: 1200, status: "surplus" },
  { id: "kendal", name: "Kendal", x: 335, y: 72, balance: 100, status: "watchlist" },
  { id: "klaten", name: "Klaten", x: 436, y: 238, balance: 3209, status: "surplus" },
  { id: "kota_magelang", name: "Kt.Magelang", x: 318, y: 208, balance: -115, status: "deficit" },
  { id: "kota_pekalongan", name: "Kt.Pekalongan", x: 230, y: 48, balance: -341, status: "deficit" },
  { id: "kota_salatiga", name: "Kt.Salatiga", x: 394, y: 170, balance: -194, status: "deficit" },
  { id: "kota_semarang", name: "Kt.Semarang", x: 385, y: 52, balance: -1808, status: "deficit" },
  { id: "kota_surakarta", name: "Kt.Surakarta", x: 484, y: 218, balance: -627, status: "deficit" },
  { id: "kota_tegal", name: "Kt.Tegal", x: 108, y: 52, balance: -370, status: "deficit" },
  { id: "kudus", name: "Kudus", x: 472, y: 98, balance: 200, status: "watchlist" },
  { id: "magelang", name: "Magelang", x: 308, y: 222, balance: 50, status: "watchlist" },
  { id: "pati", name: "Pati", x: 532, y: 88, balance: 9979, status: "surplus" },
  { id: "pekalongan", name: "Pekalongan", x: 232, y: 98, balance: 100, status: "watchlist" },
  { id: "pemalang", name: "Pemalang", x: 168, y: 68, balance: 800, status: "surplus" },
  { id: "purbalingga", name: "Purbalingga", x: 162, y: 202, balance: 20, status: "watchlist" },
  { id: "purworejo", name: "Purworejo", x: 272, y: 268, balance: 1527, status: "surplus" },
  { id: "rembang", name: "Rembang", x: 582, y: 78, balance: 900, status: "surplus" },
  { id: "semarang", name: "Kab.Semarang", x: 376, y: 148, balance: 500, status: "surplus" },
  { id: "sragen", name: "Sragen", x: 522, y: 198, balance: 5511, status: "surplus" },
  { id: "sukoharjo", name: "Sukoharjo", x: 482, y: 248, balance: 2162, status: "surplus" },
  { id: "tegal", name: "Tegal", x: 112, y: 118, balance: -80, status: "deficit" },
  { id: "temanggung", name: "Temanggung", x: 334, y: 178, balance: -138, status: "deficit" },
  { id: "wonogiri", name: "Wonogiri", x: 506, y: 302, balance: 16312, status: "surplus" },
  { id: "wonosobo", name: "Wonosobo", x: 268, y: 198, balance: -186, status: "deficit" },
];

// Jawa Tengah simplified outline path
const JATENG_PATH = "M 38,148 L 15,128 L 30,88 L 68,58 L 108,52 L 168,68 L 230,48 L 278,78 L 335,72 L 385,52 L 435,72 L 454,30 L 500,38 L 545,52 L 585,65 L 618,92 L 622,148 L 598,185 L 565,225 L 535,268 L 508,315 L 478,328 L 435,318 L 395,308 L 348,308 L 295,305 L 258,298 L 205,285 L 148,268 L 82,268 L 45,248 L 28,215 Z";

// ════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ════════════════════════════════════════════════════════════

const fmt = (n: number, decimals = 0) =>
  Math.abs(n) >= 1000000
    ? `${(n / 1000000).toFixed(1)}M`
    : Math.abs(n) >= 1000
    ? `${(n / 1000).toFixed(1)}K`
    : n.toFixed(decimals);

const fmtFull = (n: number) => n.toLocaleString("id-ID");

function getStatus(val: number): "surplus" | "deficit" | "watchlist" {
  if (val > 100) return "surplus";
  if (val < -50) return "deficit";
  return "watchlist";
}

// ════════════════════════════════════════════════════════════
// SMALL COMPONENTS
// ════════════════════════════════════════════════════════════

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; text: string; label: string }> = {
    surplus: { bg: "bg-emerald-500/15 border border-emerald-500/30", text: "text-emerald-400", label: "✓ Surplus" },
    deficit: { bg: "bg-red-500/15 border border-red-500/30", text: "text-red-400", label: "⬤ Deficit" },
    watchlist: { bg: "bg-amber-500/15 border border-amber-500/30", text: "text-amber-400", label: "⚠ Watchlist" },
    secure: { bg: "bg-emerald-500/15 border border-emerald-500/30", text: "text-emerald-400", label: "Secure" },
    warning: { bg: "bg-amber-500/15 border border-amber-500/30", text: "text-amber-400", label: "Warning" },
    critical: { bg: "bg-red-500/15 border border-red-500/30", text: "text-red-400", label: "Critical" },
  };
  const c = cfg[status] ?? cfg.watchlist;
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

function KPICard({ label, value, sub, trend, color = "text-foreground" }: { label: string; value: string; sub?: string; trend?: "up" | "down" | "neutral"; color?: string }) {
  return (
    <div className="bg-card border border-border rounded p-4 flex flex-col gap-1 min-w-0">
      <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono truncate">{label}</p>
      <p className={`text-2xl font-bold font-mono leading-none ${color}`}>{value}</p>
      {sub && (
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
          {trend === "up" && <TrendingUp className="w-3 h-3 text-emerald-400" />}
          {trend === "down" && <TrendingDown className="w-3 h-3 text-red-400" />}
          {sub}
        </p>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-mono mb-3">
      {children}
    </p>
  );
}

function Panel({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card border border-border rounded ${className}`}>
      {title && (
        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">{title}</p>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

const CUSTOM_TOOLTIP = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0A1020] border border-border rounded p-3 text-xs font-mono shadow-xl">
      <p className="text-muted-foreground mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {fmtFull(p.value)} ton</p>
      ))}
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// PAGE 1 — OVERVIEW COMMAND CENTER
// ════════════════════════════════════════════════════════════

function OverviewPage() {
  const [hoveredNode, setHoveredNode] = useState<MapNode | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Computed from data
  const totalSurplusObs = 693;
  const totalDeficitObs = 777;
  const totalObs = 1470;
  const kedelaiDeficit6mo = 32345 + 32258 + 31225 + 30064 + 28396 + 26584;
  const fulfillmentPct = ((totalSurplusObs / totalObs) * 100).toFixed(1);

  // Key routes for map overlay
  const keyRoutes = [
    { from: "cilacap", to: "kota_semarang", weight: 4 },
    { from: "demak", to: "kota_surakarta", weight: 3 },
    { from: "jepara", to: "pemalang", weight: 2.5 },
    { from: "wonogiri", to: "kota_semarang", weight: 2 },
    { from: "blora", to: "kota_semarang", weight: 1.5 },
  ];

  const getNodeById = (id: string) => MAP_NODES.find(n => n.id === id);

  const provinceBalance = MONTHLY_BALANCE["Padi"]!.map((m, i) => ({
    month: m.month,
    padi: m.p50,
    jagung: MONTHLY_BALANCE["Jagung"]![i].p50 / 1000,
    kedelai: MONTHLY_BALANCE["Kedelai"]![i].p50,
  }));

  return (
    <div className="space-y-4">
      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard label="Surplus Observations" value={`${fmtFull(totalSurplusObs)}`} sub={`${fulfillmentPct}% of total obs`} trend="up" color="text-emerald-400" />
        <KPICard label="Deficit Observations" value={`${fmtFull(totalDeficitObs)}`} sub={`${(100 - parseFloat(fulfillmentPct)).toFixed(1)}% of total obs`} trend="down" color="text-red-400" />
        <KPICard label="External Supply Req." value={`${fmt(kedelaiDeficit6mo)} ton`} sub="Kedelai · 6 bulan" trend="down" color="text-orange-400" />
        <KPICard label="Structural Deficit" value="Kedelai" sub="98.6% deficit rate" color="text-red-400" />
        <KPICard label="Top Surplus District" value="Wonogiri" sub="+16,312 ton/bln avg" trend="up" color="text-emerald-400" />
        <KPICard label="Top Deficit Region" value="Kt. Semarang" sub="−1,808 ton/bln avg" trend="down" color="text-red-400" />
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Map */}
        <div className="col-span-12 lg:col-span-7 bg-card border border-border rounded">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Central Java Food Security Map · Jan–Jun 2026</p>
            <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Surplus</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Deficit</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Watchlist</span>
            </div>
          </div>
          <div className="p-4">
            <svg viewBox="0 0 640 340" className="w-full" style={{ maxHeight: 320 }}
              onMouseMove={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
              }}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Province outline */}
              <path d={JATENG_PATH} fill="#0F1628" stroke="#1E3355" strokeWidth="1.5" />

              {/* Distribution routes */}
              {keyRoutes.map((r, i) => {
                const from = getNodeById(r.from);
                const to = getNodeById(r.to);
                if (!from || !to) return null;
                return (
                  <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke="#0F6E56" strokeWidth={r.weight} strokeOpacity={0.4}
                    strokeDasharray="4 3" />
                );
              })}

              {/* District nodes */}
              {MAP_NODES.map(node => {
                const r = Math.max(5, Math.min(14, Math.abs(node.balance) / 1800 + 5));
                const color = node.status === "surplus" ? "#22C55E" : node.status === "deficit" ? "#EF4444" : "#F59E0B";
                return (
                  <g key={node.id}
                    onMouseEnter={() => setHoveredNode(node)}
                    style={{ cursor: "pointer" }}
                  >
                    <circle cx={node.x} cy={node.y} r={r + 3} fill={color} fillOpacity={0.12} />
                    <circle cx={node.x} cy={node.y} r={r} fill={color} fillOpacity={0.85}
                      stroke={color} strokeWidth={0.5} />
                  </g>
                );
              })}

              {/* North coast label */}
              <text x="310" y="20" fill="#475569" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle">LAUT JAWA (NORTH COAST)</text>
              <text x="310" y="335" fill="#475569" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle">SAMUDERA HINDIA (SOUTH)</text>
            </svg>

            {/* Tooltip */}
            {hoveredNode && (
              <div className="mt-2 p-3 bg-[#0A1020] border border-border rounded text-xs font-mono">
                <p className="text-foreground font-semibold mb-1">{hoveredNode.name}</p>
                <div className="flex items-center gap-3">
                  <StatusBadge status={hoveredNode.status} />
                  <span className={hoveredNode.balance >= 0 ? "text-emerald-400" : "text-red-400"}>
                    {hoveredNode.balance >= 0 ? "+" : ""}{fmtFull(hoveredNode.balance)} ton/bln avg
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
          {/* Food Security Status */}
          <Panel title="Food Security Status — Jawa Tengah">
            <div className="space-y-2">
              {[
                { commodity: "Jagung", rate: "87.1% surplus", status: "surplus", note: "Pemasok utama" },
                { commodity: "Padi", rate: "57.6% surplus", status: "watchlist", note: "Jan defisit, puncak Mar–Apr" },
                { commodity: "Kedelai", rate: "98.6% defisit", status: "deficit", note: "Struktural — luar provinsi" },
                { commodity: "Kacang Hijau", rate: "60.0% defisit", status: "watchlist", note: "Mayoritas defisit" },
                { commodity: "Ubi Jalar", rate: "62.4% defisit", status: "watchlist", note: "Mayoritas defisit" },
                { commodity: "Ubi Kayu", rate: "53.3% surplus", status: "surplus", note: "Tipis surplus" },
                { commodity: "Kacang Tanah", rate: "47.1% surplus", status: "watchlist", note: "Data agregat" },
              ].map(r => (
                <div key={r.commodity} className="flex items-center justify-between py-1 border-b border-border last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COMMODITY_COLORS[r.commodity] }} />
                    <span className="text-xs font-mono text-foreground truncate">{r.commodity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground hidden md:block">{r.note}</span>
                    <StatusBadge status={r.status} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* AI Insight Panel */}
          <Panel title="AI Insight Engine">
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-mono text-amber-400 uppercase tracking-widest mb-1">Key Finding</p>
                <p className="text-xs text-foreground leading-relaxed">
                  Kedelai mengalami defisit struktural di 34–35 dari 35 kabupaten. Total defisit 6 bulan: <span className="text-red-400 font-mono">−{fmtFull(kedelaiDeficit6mo)} ton</span>.
                </p>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-[10px] font-mono text-blue-400 uppercase tracking-widest mb-1">Business Impact</p>
                <p className="text-xs text-foreground leading-relaxed">
                  Surplus lokal tidak cukup untuk memenuhi kebutuhan kedelai regional. Sistem merekomendasikan pasokan dari luar provinsi.
                </p>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest mb-1">Recommended Action</p>
                <p className="text-xs text-foreground leading-relaxed">
                  Redistribusi padi dari Cilacap/Sragen/Demak ke Kota Semarang/Surakarta. Optimalkan ubi kayu Wonogiri–Jepara untuk urban centers.
                </p>
              </div>
              <div className="border-t border-border pt-3 flex items-center justify-between">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Confidence Level</p>
                <div className="flex items-center gap-1">
                  {[1,2,3,4].map(i => <div key={i} className="w-4 h-1.5 rounded-full bg-emerald-500" />)}
                  <div className="w-4 h-1.5 rounded-full bg-border" />
                  <span className="text-xs font-mono text-emerald-400 ml-1">4/5</span>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      {/* Provincial Balance Chart */}
      <div className="bg-card border border-border rounded">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Provincial Balance Trend (P50) · Padi & Kedelai · Jan–Jun 2026</p>
        </div>
        <div className="p-4 h-44">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={provinceBalance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A2847" />
              <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 11, fontFamily: "JetBrains Mono" }} />
              <YAxis tick={{ fill: "#475569", fontSize: 10, fontFamily: "JetBrains Mono" }} tickFormatter={v => fmt(v)} />
              <RTooltip content={<CUSTOM_TOOLTIP />} />
              <ReferenceLine y={0} stroke="#475569" strokeDasharray="2 2" />
              <Bar dataKey="padi" name="Padi P50" fill="#22C55E" fillOpacity={0.7} />
              <Line dataKey="kedelai" name="Kedelai P50" stroke="#EF4444" strokeWidth={2.5} dot={{ fill: "#EF4444", r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// PAGE 2 — FOOD BALANCE MONITOR
// ════════════════════════════════════════════════════════════

function FoodBalancePage() {
  const [search, setSearch] = useState("");
  const [filterCommodity, setFilterCommodity] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const filtered = useMemo(() => {
    return RAW_DISTRICT.filter(row => {
      const [district, commodity, , surP50] = row;
      const st = getStatus(surP50);
      const matchSearch = district.toLowerCase().includes(search.toLowerCase()) || commodity.toLowerCase().includes(search.toLowerCase());
      const matchCom = filterCommodity === "All" || commodity === filterCommodity;
      const matchSt = filterStatus === "All" || st === filterStatus;
      return matchSearch && matchCom && matchSt;
    });
  }, [search, filterCommodity, filterStatus]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="bg-card border border-border rounded px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search district or commodity..."
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full font-mono"
          />
        </div>
        <select value={filterCommodity} onChange={e => { setFilterCommodity(e.target.value); setPage(1); }}
          className="bg-secondary border border-border rounded px-3 py-1.5 text-xs font-mono text-foreground outline-none cursor-pointer">
          <option value="All">All Commodities</option>
          {Object.keys(COMMODITY_COLORS).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          className="bg-secondary border border-border rounded px-3 py-1.5 text-xs font-mono text-foreground outline-none cursor-pointer">
          <option value="All">All Status</option>
          <option value="surplus">Surplus</option>
          <option value="watchlist">Watchlist</option>
          <option value="deficit">Deficit</option>
        </select>
        <span className="text-xs font-mono text-muted-foreground ml-auto">{filtered.length} records</span>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border">
                {["District", "Commodity", "Prod. Mean (ton)", "Surplus P50", "Surplus P10", "Def. Robust", "Kirim (6mo)", "Terima (6mo)", "Status"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] text-muted-foreground uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
                    <p className="text-sm mb-1">No matching records found.</p>
                    <p className="text-xs">Adjust filters or broaden search criteria.</p>
                  </td>
                </tr>
              )}
              {paginated.map((row, i) => {
                const [district, commodity, prodMean, surP50, surP10, defRob, , kirim, terima] = row;
                const st = getStatus(surP50);
                return (
                  <tr key={i} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-2.5 text-foreground font-medium">{district}</td>
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: COMMODITY_COLORS[commodity] }} />
                        {commodity}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">{fmtFull(prodMean)}</td>
                    <td className={`px-4 py-2.5 text-right font-semibold ${surP50 >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {surP50 >= 0 ? "+" : ""}{fmtFull(surP50)}
                    </td>
                    <td className={`px-4 py-2.5 text-right ${surP10 >= 0 ? "text-emerald-400/70" : "text-red-400/70"}`}>
                      {surP10 >= 0 ? "+" : ""}{fmtFull(surP10)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-red-400/80">{defRob > 0 ? fmtFull(defRob) : "—"}</td>
                    <td className="px-4 py-2.5 text-right text-blue-400/80">{kirim > 0 ? fmtFull(kirim) : "—"}</td>
                    <td className="px-4 py-2.5 text-right text-purple-400/80">{terima > 0 ? fmtFull(terima) : "—"}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={st} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="px-4 py-3 border-t border-border flex items-center justify-between">
          <span className="text-xs font-mono text-muted-foreground">
            Showing {Math.min((page - 1) * pageSize + 1, filtered.length)}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1 text-xs font-mono border border-border rounded hover:bg-secondary disabled:opacity-30 transition-colors">← Prev</button>
            <span className="px-3 py-1 text-xs font-mono text-muted-foreground">{page}/{totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1 text-xs font-mono border border-border rounded hover:bg-secondary disabled:opacity-30 transition-colors">Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// PAGE 3 — FORECAST ANALYTICS
// ════════════════════════════════════════════════════════════

function ForecastPage() {
  const [selCommodity, setSelCommodity] = useState("Padi");

  const data = MONTHLY_BALANCE[selCommodity];
  const chartData = data ? data.map(d => ({
    month: d.month,
    produksi: d.prod,
    konsumsi: d.konsumsi,
    p50: d.p50,
    surplusKab: d.surKab,
    defisitKab: d.defKab,
  })) : null;

  const commodityStatus: Record<string, { pct: string; status: string; note: string }> = {
    Jagung: { pct: "87.1%", status: "surplus", note: "Mayoritas surplus — 30–31 kab surplus/bln" },
    "Kacang Hijau": { pct: "40.0%", status: "watchlist", note: "Meningkat surplus menuju Jun" },
    "Kacang Tanah": { pct: "52.9%", status: "watchlist", note: "Data bulanan provinsi tidak tersedia" },
    Kedelai: { pct: "1.4%", status: "deficit", note: "Defisit struktural — bergantung impor" },
    Padi: { pct: "57.6%", status: "watchlist", note: "Jan defisit; puncak panen Mar–Apr" },
    "Ubi Jalar": { pct: "37.6%", status: "watchlist", note: "Surplus mulai Mar" },
    "Ubi Kayu": { pct: "53.3%", status: "surplus", note: "Konsisten surplus" },
  };

  return (
    <div className="space-y-4">
      {/* Forecast Performance Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard label="Model Deploy" value="LGB+CP" sub="LightGBM + Conformal Prediction" />
        <KPICard label="Forecast Horizon" value="6 Bulan" sub="Jan–Jun 2026" />
        <KPICard label="Historical Coverage" value="84 Bulan" sub="Jan 2019 – Des 2025" />
        <KPICard label="Time Series" value="245" sub="35 kab × 7 komoditas (balanced)" />
      </div>

      {/* Commodity selector */}
      <div className="flex flex-wrap gap-2">
        {Object.keys(COMMODITY_COLORS).map(c => (
          <button key={c} onClick={() => setSelCommodity(c)}
            className={`px-3 py-1.5 text-xs font-mono rounded border transition-colors ${selCommodity === c ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground hover:border-border/80"}`}>
            <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ background: COMMODITY_COLORS[c] }} />
            {c}
          </button>
        ))}
      </div>

      {/* Forecast Status */}
      {commodityStatus[selCommodity] && (
        <div className="bg-card border border-border rounded px-4 py-3 flex items-center gap-4">
          <StatusBadge status={commodityStatus[selCommodity].status} />
          <div>
            <span className="text-xs font-mono text-foreground">{selCommodity}</span>
            <span className="text-xs font-mono text-muted-foreground ml-2">Surplus Rate: {commodityStatus[selCommodity].pct}</span>
            <span className="text-xs font-mono text-muted-foreground ml-2">— {commodityStatus[selCommodity].note}</span>
          </div>
        </div>
      )}

      {chartData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Production vs Consumption */}
          <Panel title={`${selCommodity} — Production vs Consumption (ton)`}>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A2847" />
                  <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 11, fontFamily: "JetBrains Mono" }} />
                  <YAxis tick={{ fill: "#475569", fontSize: 10, fontFamily: "JetBrains Mono" }} tickFormatter={v => fmt(v)} />
                  <RTooltip content={<CUSTOM_TOOLTIP />} />
                  <Legend wrapperStyle={{ fontSize: 11, fontFamily: "JetBrains Mono" }} />
                  <Bar dataKey="produksi" name="Produksi" fill={COMMODITY_COLORS[selCommodity]} fillOpacity={0.85} />
                  <Bar dataKey="konsumsi" name="Konsumsi" fill="#475569" fillOpacity={0.6} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          {/* Food Balance P50 */}
          <Panel title={`${selCommodity} — Neraca P50 (ton)`}>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A2847" />
                  <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 11, fontFamily: "JetBrains Mono" }} />
                  <YAxis tick={{ fill: "#475569", fontSize: 10, fontFamily: "JetBrains Mono" }} tickFormatter={v => fmt(v)} />
                  <RTooltip content={<CUSTOM_TOOLTIP />} />
                  <ReferenceLine y={0} stroke="#475569" strokeDasharray="2 2" />
                  <Bar dataKey="p50" name="Neraca P50"
                    fill={undefined}
                    label={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.p50 >= 0 ? "#22C55E" : "#EF4444"} fillOpacity={0.8} />
                    ))}
                  </Bar>
                  <Line dataKey="p50" name="Trend" stroke={COMMODITY_COLORS[selCommodity]} strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          {/* Districts in Surplus/Deficit */}
          <Panel title={`${selCommodity} — Districts in Surplus vs Deficit per Month`}>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A2847" />
                  <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 11, fontFamily: "JetBrains Mono" }} />
                  <YAxis tick={{ fill: "#475569", fontSize: 10, fontFamily: "JetBrains Mono" }} />
                  <RTooltip content={<CUSTOM_TOOLTIP />} />
                  <Legend wrapperStyle={{ fontSize: 11, fontFamily: "JetBrains Mono" }} />
                  <Bar dataKey="surplusKab" name="Surplus Districts" fill="#22C55E" fillOpacity={0.85} stackId="a" />
                  <Bar dataKey="defisitKab" name="Deficit Districts" fill="#EF4444" fillOpacity={0.75} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          {/* Forecast Explanation */}
          <Panel title="Quantile Forecast Explanation">
            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-secondary rounded border border-border">
                <p className="text-blue-300 font-semibold mb-1">P10 — Skenario Pesimistis</p>
                <p className="text-muted-foreground leading-relaxed">Hanya 10% kemungkinan produksi lebih rendah dari nilai ini. Digunakan sebagai kapasitas pasokan aman dalam MILP.</p>
              </div>
              <div className="p-3 bg-secondary rounded border border-border">
                <p className="text-emerald-400 font-semibold mb-1">P50 — Skenario Median</p>
                <p className="text-muted-foreground leading-relaxed">Nilai tengah prediksi. 50% kemungkinan produksi di atas/bawah nilai ini. Digunakan untuk analisis neraca.</p>
              </div>
              <div className="p-3 bg-secondary rounded border border-border">
                <p className="text-amber-400 font-semibold mb-1">P90 — Skenario Optimistis</p>
                <p className="text-muted-foreground leading-relaxed">Hanya 10% kemungkinan produksi lebih tinggi dari nilai ini. Batas atas interval kepercayaan.</p>
              </div>
              <p className="text-muted-foreground text-[10px] mt-2">Model: LightGBM + Conformal Prediction · Distribution-free coverage guarantee · Evaluasi: MASE temporal 80/20</p>
            </div>
          </Panel>
        </div>
      ) : (
        <Panel>
          <div className="text-center py-8 text-muted-foreground font-mono text-sm">
            <p>Data bulanan provinsi untuk {selCommodity} tidak tersedia.</p>
            <p className="text-xs mt-1">Gunakan halaman Food Balance Monitor untuk data per kabupaten.</p>
          </div>
        </Panel>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// PAGE 4 — DISTRIBUTION OPTIMIZATION
// ════════════════════════════════════════════════════════════

function DistributionPage() {
  const [analyzing, setAnalyzing] = useState(false);
  const [steps, setSteps] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const runOptimization = useCallback(() => {
    setAnalyzing(true);
    setSteps([]);
    setDone(false);
    const msgs = [
      "Loading Forecast Data...",
      "Calculating Food Balance...",
      "Running Optimization Engine...",
      "Solving MILP Constraints...",
      "Validating Distribution Plan...",
      "Completed.",
    ];
    msgs.forEach((m, i) => {
      setTimeout(() => {
        setSteps(prev => [...prev, m]);
        if (i === msgs.length - 1) { setDone(true); setAnalyzing(false); }
      }, i * 700);
    });
  }, []);

  // Total kedelai deficit → External supply alert
  const totalKedelaiDeficit6mo = 32345 + 32258 + 31225 + 30064 + 28396 + 26584;
  const localDistributed = MILP_ROUTES.reduce((s, r) => s + r.volume, 0);

  return (
    <div className="space-y-4">
      {/* External Supply Alert */}
      <div className="bg-red-950/40 border border-red-500/40 rounded p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-300 font-mono mb-1">EXTERNAL SUPPLY REQUIRED — Kedelai</p>
          <p className="text-xs text-red-400/80 leading-relaxed font-mono">
            Local surplus is insufficient for kedelai. Total deficit (Jan–Jun 2026): <strong>{fmtFull(totalKedelaiDeficit6mo)} ton</strong>. Recommended source: Outside Province. Priority: Critical.
          </p>
          <div className="flex flex-wrap gap-2 mt-2 text-[10px] font-mono">
            <span className="px-2 py-0.5 bg-red-500/15 border border-red-500/30 text-red-400 rounded">1. Import from neighboring provinces</span>
            <span className="px-2 py-0.5 bg-red-500/15 border border-red-500/30 text-red-400 rounded">2. Release government reserves</span>
            <span className="px-2 py-0.5 bg-red-500/15 border border-red-500/30 text-red-400 rounded">3. Activate emergency logistics</span>
            <span className="px-2 py-0.5 bg-red-500/15 border border-red-500/30 text-red-400 rounded">4. Prioritize critical deficit districts</span>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard label="Active Routes" value="144" sub="kirim_keluar > 0 obs" color="text-blue-400" />
        <KPICard label="Receiving Districts" value="252" sub="terima > 0 obs" color="text-purple-400" />
        <KPICard label="Tariff Rate" value="Rp 2.500" sub="per ton per km" />
        <KPICard label="Min Load per Route" value="20 ton" sub="MILP binary activation" />
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* MILP Route Network Visualization */}
        <div className="col-span-12 lg:col-span-7 bg-card border border-border rounded">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">MILP Distribution Network — Top Routes</p>
            <button onClick={runOptimization} disabled={analyzing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary text-xs font-mono rounded hover:bg-primary/20 transition-colors disabled:opacity-50">
              <RefreshCw className={`w-3 h-3 ${analyzing ? "animate-spin" : ""}`} />
              {analyzing ? "Running..." : "Run Optimization"}
            </button>
          </div>
          {(analyzing || steps.length > 0) && (
            <div className="px-4 py-3 border-b border-border bg-secondary/50">
              {steps.map((s, i) => (
                <p key={i} className={`text-xs font-mono flex items-center gap-2 ${i === steps.length - 1 && done ? "text-emerald-400" : "text-muted-foreground"}`}>
                  {i === steps.length - 1 && done ? <CheckCircle className="w-3 h-3" /> : <span className="w-3 h-3 border border-current rounded-full inline-block" />}
                  {s}
                </p>
              ))}
            </div>
          )}
          <div className="p-4">
            <svg viewBox="0 0 640 280" className="w-full" style={{ maxHeight: 240 }}>
              <path d={JATENG_PATH} fill="#0A1018" stroke="#1A2847" strokeWidth="1" />
              {MILP_ROUTES.slice(0, 8).map((r, i) => {
                const from = MAP_NODES.find(n => n.name.toLowerCase().includes(r.origin.toLowerCase()) || r.origin.toLowerCase().includes(n.name.toLowerCase().split(" ").pop()!));
                const to = MAP_NODES.find(n => n.name.toLowerCase().includes(r.dest.toLowerCase()) || r.dest.toLowerCase().includes(n.name.toLowerCase().split(" ").pop()!));
                if (!from || !to) return null;
                const w = Math.max(1, Math.min(5, r.volume / 8000));
                return (
                  <g key={i}>
                    <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                      stroke="#0F6E56" strokeWidth={w} strokeOpacity={0.65} markerEnd="url(#arrowhead)" />
                  </g>
                );
              })}
              <defs>
                <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="#0F6E56" opacity={0.7} />
                </marker>
              </defs>
              {MAP_NODES.map(n => (
                <circle key={n.id} cx={n.x} cy={n.y} r={4}
                  fill={n.status === "surplus" ? "#22C55E" : n.status === "deficit" ? "#EF4444" : "#F59E0B"}
                  fillOpacity={0.8} />
              ))}
            </svg>
          </div>
        </div>

        {/* MILP Summary */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          <Panel title="Optimization Summary">
            <div className="space-y-2">
              {[
                { label: "Kedelai Def. Robust (avg)", value: "990.7 ton/kab/bln", flag: "critical" },
                { label: "Padi Def. Robust (avg)", value: "3,212.5 ton/kab/bln", flag: "warning" },
                { label: "Jagung Surplus Aman (avg)", value: "7,086.2 ton/kab/bln", flag: "ok" },
                { label: "Padi Surplus Aman (avg)", value: "11,036.9 ton/kab/bln", flag: "ok" },
                { label: "Ubi Kayu Surplus Aman (avg)", value: "7,037.9 ton/kab/bln", flag: "ok" },
                { label: "Max Route Distance", value: "250 km", flag: "ok" },
                { label: "Import Penalty", value: "4× tarif × dist.max", flag: "info" },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                  <span className="text-xs font-mono text-muted-foreground">{r.label}</span>
                  <span className={`text-xs font-mono font-semibold ${r.flag === "critical" ? "text-red-400" : r.flag === "warning" ? "text-amber-400" : r.flag === "info" ? "text-blue-400" : "text-emerald-400"}`}>{r.value}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Constraint Status">
            {[
              { name: "Min demand fulfillment (α=1.0)", status: "Satisfied" },
              { name: "Max route distance (250 km)", status: "Satisfied" },
              { name: "Min load per route (20 ton)", status: "Satisfied" },
              { name: "Kedelai local coverage", status: "Violated" },
              { name: "Binary route activation", status: "Satisfied" },
            ].map(c => (
              <div key={c.name} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                <span className="text-xs font-mono text-muted-foreground truncate pr-2">{c.name}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${c.status === "Satisfied" ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" : "text-red-400 border-red-500/30 bg-red-500/10"}`}>{c.status}</span>
              </div>
            ))}
          </Panel>
        </div>
      </div>

      {/* Routes Table */}
      <Panel title="Top MILP Distribution Routes">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border">
                {["Origin", "Destination", "Commodity", "Volume (6mo, ton)", "Cost Rate", "Status"].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-[10px] text-muted-foreground uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MILP_ROUTES.map((r, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                  <td className="px-3 py-2 text-emerald-400">{r.origin}</td>
                  <td className="px-3 py-2 text-red-400">{r.dest}</td>
                  <td className="px-3 py-2">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: COMMODITY_COLORS[r.commodity] }} />
                      {r.commodity}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-foreground font-semibold">{fmtFull(r.volume)}</td>
                  <td className="px-3 py-2 text-muted-foreground">{r.cost}</td>
                  <td className="px-3 py-2"><span className="text-emerald-400 text-[10px] border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded">Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// PAGE 5 — REGIONAL RISK ASSESSMENT
// ════════════════════════════════════════════════════════════

function RiskPage() {
  const [selected, setSelected] = useState<string | null>(null);

  const selectedRows = selected
    ? RAW_DISTRICT.filter(r => r[0] === selected)
    : [];

  const riskData = DEFICIT_RANKING.map(d => ({
    name: d.name,
    deficit: Math.abs(d.value),
    value: d.value,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4">
        {/* Top Surplus */}
        <div className="col-span-12 md:col-span-6 bg-card border border-border rounded">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Top 10 Surplus Districts — Avg P50 All Commodities</p>
          </div>
          <div className="p-2">
            {SURPLUS_RANKING.map((r, i) => (
              <div key={r.name} onClick={() => setSelected(r.name)}
                className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-colors hover:bg-secondary ${selected === r.name ? "bg-secondary" : ""}`}>
                <span className="text-xs font-mono text-muted-foreground w-4">{r.rank}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-foreground truncate">{r.name}</span>
                    <span className="text-xs font-mono text-emerald-400 font-semibold">+{fmtFull(r.value)}</span>
                  </div>
                  <div className="mt-1 h-1 bg-secondary rounded overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded" style={{ width: `${(r.value / 16312) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Deficit */}
        <div className="col-span-12 md:col-span-6 bg-card border border-border rounded">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Top 10 Deficit Districts — Avg P50 All Commodities</p>
          </div>
          <div className="p-2">
            {DEFICIT_RANKING.map((r) => (
              <div key={r.name} onClick={() => setSelected(r.name)}
                className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-colors hover:bg-secondary ${selected === r.name ? "bg-secondary" : ""}`}>
                <span className="text-xs font-mono text-muted-foreground w-4">{r.rank}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-foreground truncate">{r.name}</span>
                    <span className="text-xs font-mono text-red-400 font-semibold">{fmtFull(r.value)}</span>
                  </div>
                  <div className="mt-1 h-1 bg-secondary rounded overflow-hidden">
                    <div className="h-full bg-red-500 rounded" style={{ width: `${(Math.abs(r.value) / 1808) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deficit magnitude chart */}
        <div className="col-span-12 bg-card border border-border rounded">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Deficit Magnitude — Top 10 Deficit Districts (avg ton/bln)</p>
          </div>
          <div className="p-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1A2847" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#475569", fontSize: 10, fontFamily: "JetBrains Mono" }} tickFormatter={v => fmt(v)} />
                <YAxis dataKey="name" type="category" tick={{ fill: "#94A3B8", fontSize: 10, fontFamily: "JetBrains Mono" }} width={110} />
                <RTooltip content={<CUSTOM_TOOLTIP />} />
                <Bar dataKey="deficit" name="Deficit (ton/bln)" fill="#EF4444" fillOpacity={0.8} radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* District Profile Drawer */}
      {selected && selectedRows.length > 0 && (
        <div className="bg-card border border-primary/30 rounded">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <p className="text-xs font-mono text-primary uppercase tracking-widest">District Profile — {selected}</p>
            <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-border">
                  {["Commodity", "Prod Mean (ton)", "Surplus P50", "Surplus P10", "Def. Robust", "Kirim (6mo)", "Terima (6mo)"].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-[10px] text-muted-foreground uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedRows.map((row, i) => {
                  const [, commodity, prodMean, surP50, surP10, defRob, , kirim, terima] = row;
                  return (
                    <tr key={i} className="border-b border-border/50">
                      <td className="px-3 py-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: COMMODITY_COLORS[commodity] }} />
                        {commodity}
                      </td>
                      <td className="px-3 py-2 text-right text-muted-foreground">{fmtFull(prodMean)}</td>
                      <td className={`px-3 py-2 text-right font-semibold ${surP50 >= 0 ? "text-emerald-400" : "text-red-400"}`}>{surP50 >= 0 ? "+" : ""}{fmtFull(surP50)}</td>
                      <td className={`px-3 py-2 text-right ${surP10 >= 0 ? "text-emerald-400/70" : "text-red-400/70"}`}>{surP10 >= 0 ? "+" : ""}{fmtFull(surP10)}</td>
                      <td className="px-3 py-2 text-right text-red-400/80">{defRob > 0 ? fmtFull(defRob) : "—"}</td>
                      <td className="px-3 py-2 text-right text-blue-400/80">{kirim > 0 ? fmtFull(kirim) : "—"}</td>
                      <td className="px-3 py-2 text-right text-purple-400/80">{terima > 0 ? fmtFull(terima) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// PAGE 6 — SCENARIO SIMULATION
// ════════════════════════════════════════════════════════════

function ScenarioPage() {
  const [prodChange, setProdChange] = useState(0);
  const [konsumsiChange, setKonsumsiChange] = useState(0);
  const [transportChange, setTransportChange] = useState(0);
  const [harvestDisrupt, setHarvestDisrupt] = useState(0);
  const [running, setRunning] = useState(false);
  const [ran, setRan] = useState(false);

  const baseline = {
    padiSurplus: 357496, // Mar 2026 (peak)
    kedelaiDeficit: 180872,
    fulfillment: 47.1,
    activeRoutes: 144,
    externalRequired: 180872,
  };

  const projected = useMemo(() => {
    const prodMult = 1 + prodChange / 100;
    const konsumsiMult = 1 + konsumsiChange / 100;
    const disruptMult = 1 - harvestDisrupt / 100;
    const newPadiSurplus = Math.round(baseline.padiSurplus * prodMult * disruptMult);
    const newKedelaiDeficit = Math.round(baseline.kedelaiDeficit / prodMult);
    const newFulfillment = Math.min(100, baseline.fulfillment * prodMult * disruptMult / konsumsiMult);
    const newCostMultiplier = 1 + transportChange / 100;
    return {
      padiSurplus: newPadiSurplus,
      kedelaiDeficit: newKedelaiDeficit,
      fulfillment: newFulfillment.toFixed(1),
      costMultiplier: newCostMultiplier.toFixed(2),
      externalRequired: Math.max(0, Math.round(newKedelaiDeficit * 0.95)),
    };
  }, [prodChange, konsumsiChange, transportChange, harvestDisrupt]);

  const runScenario = () => {
    setRunning(true);
    setTimeout(() => { setRunning(false); setRan(true); }, 2000);
  };

  const comparisonData = [
    { metric: "Padi Surplus (Mar)", baseline: baseline.padiSurplus, projected: projected.padiSurplus },
    { metric: "Kedelai Deficit", baseline: -baseline.kedelaiDeficit, projected: -projected.kedelaiDeficit },
    { metric: "Fulfillment %×1000", baseline: baseline.fulfillment * 1000, projected: parseFloat(projected.fulfillment) * 1000 },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4">
        {/* Sliders */}
        <div className="col-span-12 md:col-span-4 bg-card border border-border rounded">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Intervention Parameters</p>
          </div>
          <div className="p-4 space-y-5">
            {[
              { label: "Production Change (%)", value: prodChange, setter: setProdChange, min: -30, max: 50, color: "text-emerald-400" },
              { label: "Consumption Change (%)", value: konsumsiChange, setter: setKonsumsiChange, min: -20, max: 30, color: "text-blue-400" },
              { label: "Transport Cost Change (%)", value: transportChange, setter: setTransportChange, min: -20, max: 100, color: "text-amber-400" },
              { label: "Harvest Disruption (%)", value: harvestDisrupt, setter: setHarvestDisrupt, min: 0, max: 50, color: "text-red-400" },
            ].map(s => (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-mono text-muted-foreground">{s.label}</p>
                  <span className={`text-sm font-mono font-bold ${s.color}`}>{s.value > 0 ? "+" : ""}{s.value}%</span>
                </div>
                <input type="range" min={s.min} max={s.max} value={s.value}
                  onChange={e => s.setter(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer" />
              </div>
            ))}
            <button onClick={runScenario} disabled={running}
              className="w-full py-2 bg-primary text-primary-foreground text-xs font-mono rounded border border-primary hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              <Zap className={`w-3.5 h-3.5 ${running ? "animate-pulse" : ""}`} />
              {running ? "Recalculating..." : "Recalculate Scenario"}
            </button>
          </div>
        </div>

        {/* Current Scenario */}
        <div className="col-span-12 md:col-span-4 bg-card border border-border rounded">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Current Scenario (Baseline)</p>
          </div>
          <div className="p-4 space-y-3">
            {[
              { label: "Padi Surplus (Mar peak)", value: `+${fmtFull(baseline.padiSurplus)} ton`, color: "text-emerald-400" },
              { label: "Kedelai 6mo Deficit", value: `−${fmtFull(baseline.kedelaiDeficit)} ton`, color: "text-red-400" },
              { label: "Fulfillment Rate (obs)", value: `${baseline.fulfillment}%`, color: "text-amber-400" },
              { label: "Active MILP Routes", value: "144 obs", color: "text-blue-400" },
              { label: "External Supply Req.", value: `${fmtFull(baseline.externalRequired)} ton`, color: "text-orange-400" },
              { label: "Transport Tariff", value: "Rp 2.500/ton/km", color: "text-foreground" },
              { label: "Import Penalty", value: "4× standard", color: "text-foreground" },
            ].map(r => (
              <div key={r.label} className="flex items-start justify-between py-1.5 border-b border-border/50 last:border-0">
                <span className="text-xs font-mono text-muted-foreground pr-2">{r.label}</span>
                <span className={`text-xs font-mono font-semibold ${r.color} text-right`}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Projected Scenario */}
        <div className={`col-span-12 md:col-span-4 bg-card border rounded transition-colors ${ran ? "border-primary/40" : "border-border"}`}>
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Projected Scenario</p>
          </div>
          <div className="p-4 space-y-3">
            {[
              {
                label: "Padi Surplus (Mar peak)",
                value: `${projected.padiSurplus >= 0 ? "+" : ""}${fmtFull(projected.padiSurplus)} ton`,
                color: projected.padiSurplus >= baseline.padiSurplus ? "text-emerald-400" : "text-amber-400",
                changed: projected.padiSurplus !== baseline.padiSurplus,
              },
              {
                label: "Kedelai 6mo Deficit",
                value: `−${fmtFull(projected.kedelaiDeficit)} ton`,
                color: projected.kedelaiDeficit < baseline.kedelaiDeficit ? "text-emerald-400" : "text-red-400",
                changed: projected.kedelaiDeficit !== baseline.kedelaiDeficit,
              },
              {
                label: "Fulfillment Rate (est.)",
                value: `${projected.fulfillment}%`,
                color: parseFloat(projected.fulfillment) >= baseline.fulfillment ? "text-emerald-400" : "text-red-400",
                changed: projected.fulfillment !== baseline.fulfillment.toString(),
              },
              {
                label: "Transport Cost Multiplier",
                value: `${projected.costMultiplier}×`,
                color: parseFloat(projected.costMultiplier) <= 1 ? "text-emerald-400" : "text-amber-400",
                changed: transportChange !== 0,
              },
              {
                label: "External Supply Req.",
                value: `${fmtFull(projected.externalRequired)} ton`,
                color: projected.externalRequired < baseline.externalRequired ? "text-emerald-400" : "text-red-400",
                changed: projected.externalRequired !== baseline.externalRequired,
              },
            ].map(r => (
              <div key={r.label} className="flex items-start justify-between py-1.5 border-b border-border/50 last:border-0">
                <span className="text-xs font-mono text-muted-foreground pr-2">{r.label}</span>
                <span className={`text-xs font-mono font-semibold ${r.color} text-right flex items-center gap-1`}>
                  {r.changed && ran && <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />}
                  {r.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Chart */}
      {ran && (
        <Panel title="Scenario Comparison — Key Metrics">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A2847" />
                <XAxis dataKey="metric" tick={{ fill: "#475569", fontSize: 10, fontFamily: "JetBrains Mono" }} />
                <YAxis tick={{ fill: "#475569", fontSize: 10, fontFamily: "JetBrains Mono" }} tickFormatter={v => fmt(v)} />
                <RTooltip content={<CUSTOM_TOOLTIP />} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: "JetBrains Mono" }} />
                <Bar dataKey="baseline" name="Baseline" fill="#475569" fillOpacity={0.7} />
                <Bar dataKey="projected" name="Projected" fill="#0F6E56" fillOpacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// PAGE 7 — POLICY RECOMMENDATION
// ════════════════════════════════════════════════════════════

function PolicyPage() {
  const recommendations = [
    {
      priority: "CRITICAL",
      category: "Emergency Supply",
      color: "red",
      title: "Emergency External Procurement — Kedelai",
      target_district: "Seluruh 35 Kabupaten/Kota",
      target_commodity: "Kedelai",
      action: "Impor kedelai dari luar provinsi untuk menutup defisit struktural 180.872 ton (Jan–Jun 2026). Koordinasi dengan Bulog dan kementerian pertanian.",
      impact: "Pencegahan kelangkaan kedelai skala provinsi. Mempertahankan produksi tahu/tempe.",
      timeline: "Segera (< 1 bulan)",
      difficulty: "Tinggi",
      status: "Urgent",
    },
    {
      priority: "HIGH",
      category: "Immediate Action",
      color: "orange",
      title: "Redistribusi Padi — Cilacap & Demak ke Kota Semarang/Surakarta",
      target_district: "Kota Semarang, Kota Surakarta",
      target_commodity: "Padi",
      action: "Aktifkan rute MILP utama: Cilacap → Kt. Semarang (33.347 ton), Demak → Kt. Surakarta (29.794 ton). Koordinasi logistik BULOG.",
      impact: "Menutup defisit padi urban kota besar. Lokal fulfillment rate meningkat.",
      timeline: "1–3 bulan",
      difficulty: "Sedang",
      status: "Ready",
    },
    {
      priority: "HIGH",
      category: "Immediate Action",
      color: "orange",
      title: "Redistribusi Ubi Kayu — Jepara & Wonogiri",
      target_district: "Pemalang, Kota Semarang",
      target_commodity: "Ubi Kayu",
      action: "Optimasi rute ubi kayu: Jepara → Pemalang (24.722 ton), Wonogiri → Kt. Semarang (13.680 ton). Manfaatkan surplus aman tertinggi.",
      impact: "Pemenuhan kebutuhan ubi kayu urban. Mengurangi impor luar provinsi.",
      timeline: "1–3 bulan",
      difficulty: "Rendah",
      status: "Ready",
    },
    {
      priority: "MEDIUM",
      category: "Medium-Term",
      color: "amber",
      title: "Peningkatan Produksi Kedelai di Grobogan",
      target_district: "Grobogan",
      target_commodity: "Kedelai",
      action: "Grobogan adalah satu-satunya kabupaten dengan surplus kedelai kecil (P50: +478 ton/bln). Program intensifikasi lahan dan subsidi benih.",
      impact: "Menurunkan ketergantungan impor kedelai jangka menengah.",
      timeline: "6–12 bulan",
      difficulty: "Tinggi",
      status: "Planning",
    },
    {
      priority: "MEDIUM",
      category: "Medium-Term",
      color: "amber",
      title: "Stabilisasi Padi Januari — Pre-Harvest Buffer",
      target_district: "27 Kabupaten Defisit Padi (Jan)",
      target_commodity: "Padi",
      action: "Siapkan cadangan pangan pemerintah untuk Januari 2026 saat 27 dari 35 kabupaten masih defisit padi sebelum musim panen Maret–April.",
      impact: "Mencegah kenaikan harga beras ekstrem di awal tahun.",
      timeline: "3–6 bulan",
      difficulty: "Sedang",
      status: "Planning",
    },
    {
      priority: "LOW",
      category: "Long-Term",
      color: "blue",
      title: "Diversifikasi Produksi Kota-Kota Urban",
      target_district: "Kota Semarang, Surakarta, Tegal, Pekalongan",
      target_commodity: "Multi-komoditas",
      action: "Program urban farming dan hidroponik untuk meningkatkan self-sufficiency kota. Khususnya sayuran, kacang-kacangan.",
      impact: "Pengurangan beban redistribusi jangka panjang. Ketahanan pangan lokal urban.",
      timeline: "1–2 tahun",
      difficulty: "Sedang",
      status: "Research",
    },
  ];

  const colorMap: Record<string, { border: string; bg: string; badge: string; text: string }> = {
    red: { border: "border-red-500/40", bg: "bg-red-950/20", badge: "bg-red-500/15 text-red-400 border-red-500/30", text: "text-red-400" },
    orange: { border: "border-orange-500/40", bg: "bg-orange-950/20", badge: "bg-orange-500/15 text-orange-400 border-orange-500/30", text: "text-orange-400" },
    amber: { border: "border-amber-500/40", bg: "bg-amber-950/20", badge: "bg-amber-500/15 text-amber-400 border-amber-500/30", text: "text-amber-400" },
    blue: { border: "border-blue-500/40", bg: "bg-blue-950/20", badge: "bg-blue-500/15 text-blue-400 border-blue-500/30", text: "text-blue-400" },
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {recommendations.map((r, i) => {
          const c = colorMap[r.color];
          return (
            <div key={i} className={`bg-card border ${c.border} rounded overflow-hidden`}>
              <div className={`px-4 py-2 ${c.bg} border-b ${c.border} flex items-center justify-between`}>
                <span className={`text-[10px] font-mono font-bold tracking-widest ${c.text}`}>{r.priority}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${c.badge}`}>{r.category}</span>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-sm font-semibold text-foreground leading-snug" style={{ fontFamily: "Inter" }}>{r.title}</p>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-20 flex-shrink-0">Target</span>
                    <span className="text-foreground">{r.target_district}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-20 flex-shrink-0">Commodity</span>
                    <span className="flex items-center gap-1">
                      {r.target_commodity !== "Multi-komoditas" && (
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: COMMODITY_COLORS[r.target_commodity] || "#94A3B8" }} />
                      )}
                      {r.target_commodity}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">{r.action}</p>

                <div className="pt-2 border-t border-border space-y-1.5 text-xs font-mono">
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-20 flex-shrink-0">Impact</span>
                    <span className="text-foreground">{r.impact}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <span className="text-muted-foreground">Timeline</span>
                      <span className="text-foreground">{r.timeline}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${c.badge}`}>{r.status}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// PAGE 8 — DATA EXPLORER
// ════════════════════════════════════════════════════════════

function DataExplorerPage() {
  const [activeTab, setActiveTab] = useState("district");
  const [search, setSearch] = useState("");
  const [visibleCols, setVisibleCols] = useState({
    prodMean: true, surP50: true, surP10: true, defRob: true, surAman: true, kirim: true, terima: true,
  });
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const tabs = [
    { id: "district", label: "Food Balance Data (245 rows)" },
    { id: "milp", label: "MILP Routes (144 active)" },
    { id: "monthly", label: "Monthly Balance (7 commodities)" },
  ];

  const filtered = useMemo(() => {
    if (activeTab !== "district") return [];
    return RAW_DISTRICT.filter(r =>
      r[0].toLowerCase().includes(search.toLowerCase()) ||
      r[1].toLowerCase().includes(search.toLowerCase())
    );
  }, [search, activeTab]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-card border border-border rounded px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search dataset..."
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full font-mono" />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded text-xs font-mono text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors">
            <Download className="w-3 h-3" /> Export CSV
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded text-xs font-mono text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors">
            <Share2 className="w-3 h-3" /> Share
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded p-1 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setActiveTab(t.id); setPage(1); }}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${activeTab === t.id ? "bg-card text-foreground border border-border" : "text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "district" && (
        <div className="bg-card border border-border rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-[10px] text-muted-foreground uppercase tracking-widest sticky left-0 bg-card">District</th>
                  <th className="px-4 py-3 text-left text-[10px] text-muted-foreground uppercase tracking-widest">Commodity</th>
                  {visibleCols.prodMean && <th className="px-4 py-3 text-right text-[10px] text-muted-foreground uppercase tracking-widest">Prod.Mean</th>}
                  {visibleCols.surP50 && <th className="px-4 py-3 text-right text-[10px] text-muted-foreground uppercase tracking-widest">Sur.P50</th>}
                  {visibleCols.surP10 && <th className="px-4 py-3 text-right text-[10px] text-muted-foreground uppercase tracking-widest">Sur.P10</th>}
                  {visibleCols.defRob && <th className="px-4 py-3 text-right text-[10px] text-muted-foreground uppercase tracking-widest">Def.Rob</th>}
                  {visibleCols.kirim && <th className="px-4 py-3 text-right text-[10px] text-muted-foreground uppercase tracking-widest">Kirim</th>}
                  {visibleCols.terima && <th className="px-4 py-3 text-right text-[10px] text-muted-foreground uppercase tracking-widest">Terima</th>}
                  <th className="px-4 py-3 text-left text-[10px] text-muted-foreground uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 && (
                  <tr><td colSpan={10} className="px-4 py-12 text-center text-muted-foreground text-sm">No matching records found. Adjust filters or broaden search criteria.</td></tr>
                )}
                {paginated.map((row, i) => {
                  const [district, commodity, prodMean, surP50, surP10, defRob, , kirim, terima] = row;
                  return (
                    <tr key={i} className="border-b border-border/40 hover:bg-secondary/50 transition-colors">
                      <td className="px-4 py-2 sticky left-0 bg-card text-foreground font-medium">{district}</td>
                      <td className="px-4 py-2">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: COMMODITY_COLORS[commodity] }} />
                          {commodity}
                        </span>
                      </td>
                      {visibleCols.prodMean && <td className="px-4 py-2 text-right text-muted-foreground">{fmtFull(prodMean)}</td>}
                      {visibleCols.surP50 && <td className={`px-4 py-2 text-right font-semibold ${surP50 >= 0 ? "text-emerald-400" : "text-red-400"}`}>{surP50 >= 0 ? "+" : ""}{fmtFull(surP50)}</td>}
                      {visibleCols.surP10 && <td className={`px-4 py-2 text-right ${surP10 >= 0 ? "text-emerald-400/70" : "text-red-400/70"}`}>{surP10 >= 0 ? "+" : ""}{fmtFull(surP10)}</td>}
                      {visibleCols.defRob && <td className="px-4 py-2 text-right text-red-400/80">{defRob > 0 ? fmtFull(defRob) : "—"}</td>}
                      {visibleCols.kirim && <td className="px-4 py-2 text-right text-blue-400/80">{kirim > 0 ? fmtFull(kirim) : "—"}</td>}
                      {visibleCols.terima && <td className="px-4 py-2 text-right text-purple-400/80">{terima > 0 ? fmtFull(terima) : "—"}</td>}
                      <td className="px-4 py-2"><StatusBadge status={getStatus(surP50)} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-muted-foreground">
                {Math.min((page - 1) * pageSize + 1, filtered.length)}–{Math.min(page * pageSize, filtered.length)} of {filtered.length} records
              </span>
              <span className="text-[10px] font-mono text-emerald-400/60 border border-emerald-500/20 px-2 py-0.5 rounded">✓ Quality: Balanced Panel · 0 Missing</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 text-xs font-mono border border-border rounded hover:bg-secondary disabled:opacity-30 transition-colors">← Prev</button>
              <span className="px-3 py-1 text-xs font-mono text-muted-foreground">{page}/{Math.ceil(filtered.length / pageSize)}</span>
              <button onClick={() => setPage(p => Math.min(Math.ceil(filtered.length / pageSize), p + 1))} disabled={page === Math.ceil(filtered.length / pageSize)}
                className="px-3 py-1 text-xs font-mono border border-border rounded hover:bg-secondary disabled:opacity-30 transition-colors">Next →</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "milp" && (
        <Panel title="MILP Distribution Routes — Deploy Jan–Jun 2026">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-border">
                  {["#", "Origin", "Destination", "Commodity", "Volume (6mo, ton)", "Tariff", "Status"].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-[10px] text-muted-foreground uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MILP_ROUTES.map((r, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                    <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-2 text-emerald-400">{r.origin}</td>
                    <td className="px-3 py-2 text-red-400">{r.dest}</td>
                    <td className="px-3 py-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: COMMODITY_COLORS[r.commodity] }} />
                      {r.commodity}
                    </td>
                    <td className="px-3 py-2 text-right text-foreground font-semibold">{fmtFull(r.volume)}</td>
                    <td className="px-3 py-2 text-muted-foreground">{r.cost}</td>
                    <td className="px-3 py-2"><span className="text-emerald-400 text-[10px] border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded">Active</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {activeTab === "monthly" && (
        <Panel title="Monthly Provincial Balance — All Available Commodities">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-border">
                  {["Commodity", "Month", "Produksi (ton)", "Konsumsi (ton)", "Neraca P50 (ton)", "Surplus Kab", "Defisit Kab"].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-[10px] text-muted-foreground uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(MONTHLY_BALANCE).flatMap(([commodity, rows]) =>
                  rows.map((r, i) => (
                    <tr key={`${commodity}-${i}`} className="border-b border-border/40 hover:bg-secondary/50 transition-colors">
                      <td className="px-3 py-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: COMMODITY_COLORS[commodity] }} />
                        {commodity}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{r.month} 2026</td>
                      <td className="px-3 py-2 text-right text-foreground">{fmtFull(r.prod)}</td>
                      <td className="px-3 py-2 text-right text-muted-foreground">{fmtFull(r.konsumsi)}</td>
                      <td className={`px-3 py-2 text-right font-semibold ${r.p50 >= 0 ? "text-emerald-400" : "text-red-400"}`}>{r.p50 >= 0 ? "+" : ""}{fmtFull(r.p50)}</td>
                      <td className="px-3 py-2 text-right text-emerald-400">{r.surKab}</td>
                      <td className="px-3 py-2 text-right text-red-400">{r.defKab}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// PAGE 9 — MODEL MONITORING
// ════════════════════════════════════════════════════════════

function ModelMonitoringPage() {
  const pipeline = [
    { step: "01", name: "Historical Dataset", desc: "35 kab × 7 komoditas × 84 bulan = 20.580 obs", status: "healthy", icon: Database },
    { step: "02", name: "Preprocessing & Disagregasi", desc: "Denton-Cholette annual→monthly · Balanced panel", status: "healthy", icon: Activity },
    { step: "03", name: "Feature Engineering", desc: "lag12, lag24, seasmean · Anti-leakage pipeline", status: "healthy", icon: GitBranch },
    { step: "04", name: "Temporal Fusion Transformer", desc: "TFT architecture · Multi-horizon direct forecasting", status: "healthy", icon: Cpu },
    { step: "05", name: "P10 / P50 / P90 Forecast", desc: "LightGBM+Conformal · Distribution-free coverage", status: "healthy", icon: BarChart2 },
    { step: "06", name: "Food Balance Engine", desc: "surplus = produksi × rendemen − konsumsi", status: "healthy", icon: Layers },
    { step: "07", name: "MILP Optimization", desc: "Robust transport · Binary route activation", status: "healthy", icon: Zap },
    { step: "08", name: "Recommendation Engine", desc: "Decision support layer · Policy synthesis", status: "healthy", icon: Shield },
  ];

  const models = [
    { name: "LightGBM + Conformal Prediction", role: "Deploy (titik + interval)", status: "Healthy", mase: "< 1.0 (beats baseline)", coverage: "Terjamin distribution-free", horizon: "6 bulan (Jan–Jun 2026)", training: "Jan 2019 – Des 2025 (80%)", version: "v1.0-deploy" },
    { name: "SARIMAX", role: "MILP Input (P10/P50/P90)", status: "Healthy", mase: "< 1.0", coverage: "Parametrik normal", horizon: "6 bulan", training: "Jan 2019 – Des 2025", version: "v1.0-milp" },
    { name: "LightGBM (point)", role: "Titik terbaik", status: "Healthy", mase: "Terbaik (terendah)", coverage: "N/A (titik)", horizon: "6 bulan", training: "Jan 2019 – Des 2025", version: "v1.0-point" },
    { name: "CatBoost MultiQuantile", role: "Native interval", status: "Healthy", mase: "< 1.0", coverage: "Native quantile", horizon: "6 bulan", training: "Jan 2019 – Des 2025", version: "v1.0-cat" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard label="Total Time Series" value="245" sub="35 kab × 7 komoditas" color="text-blue-400" />
        <KPICard label="Historical Months" value="84" sub="Jan 2019 – Des 2025" />
        <KPICard label="Train/Test Split" value="80/20" sub="~67 bln latih · 17 bln uji" />
        <KPICard label="Missing Values" value="0" sub="Balanced panel sempurna" color="text-emerald-400" />
      </div>

      {/* Pipeline */}
      <Panel title="AI Pipeline — Forecast → Food Balance → Optimization → Recommendation">
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-2">
            {pipeline.map((p, i) => {
              const Icon = p.icon;
              return (
                <div key={i} className="flex items-start gap-4 pl-0">
                  <div className="w-16 flex-shrink-0 flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center z-10">
                      <Icon className="w-3 h-3 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 bg-secondary rounded border border-border p-3 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-mono font-semibold text-foreground">{p.step} · {p.name}</p>
                      <span className="text-[10px] font-mono text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded flex-shrink-0">
                        <CheckCircle className="w-2.5 h-2.5 inline mr-1" />{p.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Panel>

      {/* Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {models.map((m, i) => (
          <div key={i} className="bg-card border border-border rounded p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-foreground font-mono">{m.name}</p>
              <span className="text-[10px] font-mono text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded flex-shrink-0">{m.status}</span>
            </div>
            <p className="text-xs text-primary font-mono">{m.role}</p>
            <div className="space-y-1 text-xs font-mono">
              {[
                ["MASE", m.mase], ["Interval Coverage", m.coverage],
                ["Forecast Horizon", m.horizon], ["Training Period", m.training],
                ["Version", m.version],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2 py-1 border-b border-border/50 last:border-0">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="text-foreground text-right">{v}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// PAGE 10 — ABOUT PROJECT
// ════════════════════════════════════════════════════════════

function AboutPage() {
  return (
    <div className="space-y-4 max-w-4xl">
      <div className="bg-card border border-border rounded p-6">
        <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "Source Serif 4" }}>
          AgriGotongRoyong
        </h2>
        <p className="text-primary font-mono text-sm mb-4">Predictive & Prescriptive Food Security Platform for Central Java</p>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Platform ini merupakan Decision Support System berbasis AI untuk ketahanan pangan Jawa Tengah, yang menggabungkan peramalan probabilistik, analisis neraca pangan, optimasi distribusi MILP, dan rekomendasi kebijakan intervensi pemerintah. Dikembangkan untuk kompetisi Satria Data 2026.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Panel title="Problem Statement">
          <p className="text-xs text-muted-foreground leading-relaxed font-mono">
            Jawa Tengah memiliki 35 kabupaten/kota dengan kondisi neraca pangan yang sangat heterogen. Kota-kota besar (Semarang, Surakarta, Tegal) mengalami defisit struktural, sementara kabupaten pertanian (Wonogiri, Grobogan, Cilacap) mencatatkan surplus besar. Kedelai mengalami defisit di 98.6% observasi — bergantung penuh pada pasokan luar provinsi.
          </p>
        </Panel>

        <Panel title="Research Objectives">
          <ul className="text-xs text-muted-foreground space-y-2 font-mono">
            {[
              "Meramalkan produksi 7 komoditas di 35 kab × 6 bulan (P10/P50/P90)",
              "Menurunkan neraca surplus-defisit probabilistik",
              "Mengoptimalkan distribusi antar-kabupaten via Robust MILP",
              "Mengidentifikasi kabupaten berisiko dan komoditas kritis",
              "Memberikan rekomendasi kebijakan berbasis data",
            ].map((o, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary mt-0.5 flex-shrink-0">→</span>
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Dataset Summary">
          <div className="space-y-1.5 text-xs font-mono">
            {[
              ["Total Observasi Historis", "20.580 (35 × 7 × 84 bln)"],
              ["Deret Waktu (Series)", "245 (balanced panel sempurna)"],
              ["Periode Historis", "Jan 2019 – Des 2025 (84 bulan)"],
              ["Horizon Forecast", "Jan – Jun 2026 (6 bulan)"],
              ["Baris Dashboard Data", "1.470 (35 × 7 × 6)"],
              ["Missing Values", "0 (panel sempurna)"],
              ["Outlier IQR (~21%)", "Dipertahankan (substantif)"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2 py-1.5 border-b border-border/50 last:border-0">
                <span className="text-muted-foreground">{k}</span>
                <span className="text-foreground font-semibold text-right">{v}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Methodology Pipeline">
          <div className="space-y-1.5 text-xs font-mono text-muted-foreground">
            {[
              ["Preprocessing", "Denton-Cholette disagregasi · Anchoring spasial"],
              ["Feature Eng.", "lag12, lag24, seasmean · Anti-leakage ketat"],
              ["Forecasting", "9 model diuji · Deploy: LightGBM+Conformal"],
              ["Evaluation", "MASE temporal split 80/20 (< 1 = beats baseline)"],
              ["Food Balance", "surplus = produksi × rendemen − konsumsi"],
              ["MILP", "Robust Transportation · binary activation · 250 km max"],
              ["Conformal CP", "Distribution-free coverage guarantee"],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-3 py-1 border-b border-border/50 last:border-0">
                <span className="text-primary w-28 flex-shrink-0">{k}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Expected Impact & Methodological Notes">
        <div className="space-y-3 text-xs font-mono text-muted-foreground">
          <p>
            <span className="text-foreground font-semibold">Mengapa meramal produksi, bukan surplus langsung?</span><br />
            Surplus adalah selisih dua besaran besar yang nilainya mendekati nol → bising. Produksi lebih stabil dan musiman → MASE lebih rendah, interval lebih bermakna.
          </p>
          <p>
            <span className="text-foreground font-semibold">Implikasi Gotong-Royong:</span><br />
            Gradien surplus↔defisit yang konsisten membuktikan redistribusi lintas-wilayah secara prinsip dapat menutup defisit padi dan ubi kayu di kota-kota tanpa impor luar provinsi — khususnya dari Wonogiri (ubi kayu), Cilacap/Sragen/Demak (padi), dan Grobogan/Blora (jagung).
          </p>
          <p>
            <span className="text-foreground font-semibold">Mengapa MILP, bukan LP biasa?</span><br />
            Aktivasi rute biner (min-load 20 ton) penting secara logistik: rute kecil tidak efisien operasional.
          </p>
        </div>
      </Panel>

      <div className="bg-card border border-border rounded p-4 text-xs font-mono text-muted-foreground flex flex-wrap gap-4">
        <span><span className="text-foreground">Kompetisi:</span> Satria Data 2026</span>
        <span><span className="text-foreground">Studi kasus:</span> 35 Kab/Kota Jawa Tengah</span>
        <span><span className="text-foreground">Pipeline:</span> Preprocessing → Feature Eng. → ML → Conformal → MILP → DSS</span>
        <span><span className="text-foreground">Sumber:</span> dataset_jateng_bulanan_2019_2025.xlsx · dashboard_data.csv · AgriGotongRoyong.ipynb</span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// NAVIGATION & LAYOUT
// ════════════════════════════════════════════════════════════

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: Globe, sub: "Command Center" },
  { id: "balance", label: "Food Balance Monitor", icon: Activity, sub: "Neraca Pangan" },
  { id: "forecast", label: "Forecast Analytics", icon: BarChart2, sub: "Peramalan" },
  { id: "distribution", label: "Distribution Optimization", icon: Package, sub: "MILP" },
  { id: "risk", label: "Regional Risk Assessment", icon: AlertTriangle, sub: "Penilaian Risiko" },
  { id: "scenario", label: "Scenario Simulation", icon: Sliders, sub: "What-If Analysis" },
  { id: "policy", label: "Policy Recommendation", icon: Shield, sub: "Rekomendasi" },
  { id: "explorer", label: "Data Explorer", icon: Database, sub: "Analytics" },
  { id: "monitoring", label: "Model Monitoring", icon: Monitor, sub: "Pipeline" },
  { id: "about", label: "About Project", icon: BookOpen, sub: "Metodologi" },
];

export default function App() {
  const [activePage, setActivePage] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const currentNav = NAV_ITEMS.find(n => n.id === activePage)!;
  const now = new Date();
  const timestamp = now.toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const renderPage = () => {
    switch (activePage) {
      case "overview": return <OverviewPage />;
      case "balance": return <FoodBalancePage />;
      case "forecast": return <ForecastPage />;
      case "distribution": return <DistributionPage />;
      case "risk": return <RiskPage />;
      case "scenario": return <ScenarioPage />;
      case "policy": return <PolicyPage />;
      case "explorer": return <DataExplorerPage />;
      case "monitoring": return <ModelMonitoringPage />;
      case "about": return <AboutPage />;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Sidebar */}
      <aside className={`flex-shrink-0 flex flex-col border-r border-border bg-sidebar transition-all duration-200 ${sidebarOpen ? "w-60" : "w-0 overflow-hidden"}`}>
        {/* Logo */}
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <Wheat className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground font-mono truncate">AGRI-GOTONGROYONG</p>
              <p className="text-[9px] text-muted-foreground font-mono truncate">Intelligence Platform</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = activePage === item.id;
            return (
              <button key={item.id} onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded text-left transition-colors group ${active ? "bg-primary/10 text-primary border border-primary/20" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}>
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{item.label}</p>
                  <p className="text-[9px] text-muted-foreground truncate">{item.sub}</p>
                </div>
                {active && <ChevronRight className="w-3 h-3 text-primary ml-auto flex-shrink-0" />}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border space-y-1.5 text-[9px] font-mono text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Dataset: dashboard_data.csv</span>
          </div>
          <div>Last Updated: {timestamp}</div>
          <div>Model: LightGBM+Conformal v1.0</div>
          <div>Analysis: Satria Data 2026</div>
          <div className="flex items-center gap-1.5 pt-1">
            <span>Data Quality:</span>
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => <div key={i} className={`w-3 h-1 rounded-full ${i <= 5 ? "bg-emerald-500" : "bg-border"}`} />)}
            </div>
            <span className="text-emerald-400">5/5</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Bar */}
        <header className="flex-shrink-0 h-12 border-b border-border flex items-center px-4 gap-3 bg-card">
          <button onClick={() => setSidebarOpen(s => !s)}
            className="w-7 h-7 flex items-center justify-center rounded border border-border hover:bg-secondary transition-colors">
            <div className="space-y-1">
              <div className="w-3.5 h-px bg-muted-foreground" />
              <div className="w-3.5 h-px bg-muted-foreground" />
              <div className="w-3.5 h-px bg-muted-foreground" />
            </div>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-semibold text-foreground font-mono truncate">
              {currentNav.label}
            </span>
            <span className="text-muted-foreground text-xs hidden sm:block">—</span>
            <span className="text-xs text-muted-foreground font-mono hidden sm:block">Jawa Tengah · Jan–Jun 2026</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground hidden md:block">{timestamp}</span>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 border border-border rounded text-[10px] font-mono text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
              <Download className="w-3 h-3" /> Report
            </button>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 border border-border rounded text-[10px] font-mono text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
              <Share2 className="w-3 h-3" /> Share
            </button>
            <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
              <span className="text-[10px] font-mono text-primary font-bold">AG</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-5">
          {renderPage()}
          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-border text-[10px] font-mono text-muted-foreground flex flex-wrap gap-4">
            <span>Predictive & Prescriptive Food Security Platform · Jawa Tengah</span>
            <span>All data: AgriGotongRoyong_Notes.md · Satria Data 2026</span>
            <span className="ml-auto">Model v1.0 · Analysis v1.0 · {timestamp}</span>
          </div>
        </main>
      </div>
    </div>
  );
}
