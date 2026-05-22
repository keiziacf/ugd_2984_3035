import { getSqlClient } from '@/lib/neon';
import { flights, todayShipmentsList, users } from '@/lib/mock-data';

type SqlClient = ReturnType<typeof getSqlClient>;

type TableCount = {
  table: string;
  count: number;
};

type OrphanCheck = {
  relation: string;
  missingRows: number;
};

type ConnectionInfo = {
  databaseName: string;
  branchId: string | null;
  branchName: string | null;
  endpointId: string | null;
  checkedAt: string;
};

type SetupReport = {
  connection: ConnectionInfo;
  masterTables: string[];
  transactionTables: string[];
  junctionTables: string[];
  projectTables: TableCount[];
  emptyProjectTables: string[];
  emptyPublicTables: string[];
  nonProjectTables: string[];
  orphanChecks: OrphanCheck[];
  relationSamples: {
    oneToManyFlightsToShipments: Array<{
      flight_number: string;
      airline: string;
      shipment_count: number;
    }>;
    oneToManyShipmentsToTrackingEvents: Array<{
      awb: string;
      shipper: string;
      tracking_count: number;
    }>;
    oneToOneUsersToProfiles: Array<{
      user_id: number;
      name: string;
      employee_number: string;
      shift_name: string;
    }>;
    manyToManyShipmentsToServices: Array<{
      awb: string;
      commodity: string;
      service_name: string;
    }>;
  };
  masterDataSamples: {
    airports: Array<{ code: string; name: string; city: string }>;
    airlines: Array<{ code: string; name: string }>;
    commodityCategories: Array<{ code: string; name: string }>;
    handlingServices: Array<{ code: string; name: string }>;
  };
  shipmentOverview: Array<{
    awb: string;
    shipper: string;
    consignee: string;
    current_status: string;
    flight_number: string;
    airline: string;
    route: string;
    latest_location: string | null;
    latest_timestamp: string | null;
    tracking_event_count: number;
  }>;
  warnings: string[];
};

type AirportMaster = {
  code: string;
  name: string;
  city: string;
  province: string;
  cargoTerminal: string;
};

type AirlineMaster = {
  code: string;
  name: string;
  serviceType: string;
  homeBase: string;
};

type CommodityCategoryMaster = {
  code: string;
  name: string;
  handlingNotes: string;
};

type HandlingServiceMaster = {
  code: string;
  name: string;
  description: string;
  slaMinutes: number;
};

type UserProfileSeed = {
  userId: number;
  employeeNumber: string;
  phone: string;
  certification: string;
  shiftName: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
};

type ShipmentServiceSeed = {
  shipmentAwb: string;
  serviceCode: string;
  assignmentNote: string;
};

export const MASTER_TABLES = [
  'airports',
  'airlines',
  'commodity_categories',
  'handling_services',
] as const;

export const TRANSACTION_TABLES = [
  'users',
  'user_profiles',
  'flights',
  'shipments',
  'tracking_events',
] as const;

export const JUNCTION_TABLES = ['shipment_services'] as const;

export const PROJECT_TABLES = [
  ...MASTER_TABLES,
  ...TRANSACTION_TABLES,
  ...JUNCTION_TABLES,
] as const;

const AIRPORTS: AirportMaster[] = [
  { code: 'BPN', name: 'Sultan Aji Muhammad Sulaiman', city: 'Balikpapan', province: 'Kalimantan Timur', cargoTerminal: 'Terminal Kargo Domestik' },
  { code: 'CGK', name: 'Soekarno-Hatta', city: 'Tangerang', province: 'Banten', cargoTerminal: 'Terminal 2D Kargo' },
  { code: 'DPS', name: 'Ngurah Rai', city: 'Denpasar', province: 'Bali', cargoTerminal: 'Terminal Kargo Internasional' },
  { code: 'JOG', name: 'Adisutjipto Yogyakarta', city: 'Yogyakarta', province: 'DI Yogyakarta', cargoTerminal: 'Gudang Kargo Timur' },
  { code: 'KNO', name: 'Kualanamu', city: 'Deli Serdang', province: 'Sumatera Utara', cargoTerminal: 'Terminal Kargo Utama' },
  { code: 'PLM', name: 'SMB II Palembang', city: 'Palembang', province: 'Sumatera Selatan', cargoTerminal: 'Terminal Kargo Selatan' },
  { code: 'SOC', name: 'Adi Soemarmo Solo', city: 'Boyolali', province: 'Jawa Tengah', cargoTerminal: 'Gudang Kargo Barat' },
  { code: 'SRG', name: 'Ahmad Yani Semarang', city: 'Semarang', province: 'Jawa Tengah', cargoTerminal: 'Terminal Kargo Ahmad Yani' },
  { code: 'SUB', name: 'Juanda', city: 'Sidoarjo', province: 'Jawa Timur', cargoTerminal: 'Terminal Kargo Domestik' },
  { code: 'UPG', name: 'Hasanuddin', city: 'Makassar', province: 'Sulawesi Selatan', cargoTerminal: 'Terminal Kargo Hasanuddin' },
];

const AIRLINES: AirlineMaster[] = [
  { code: 'AK', name: 'AirAsia Indonesia', serviceType: 'Low Cost Carrier', homeBase: 'CGK' },
  { code: 'GA', name: 'Garuda Indonesia', serviceType: 'Full Service Carrier', homeBase: 'CGK' },
  { code: 'ID', name: 'Batik Air', serviceType: 'Full Service Carrier', homeBase: 'CGK' },
  { code: 'IP', name: 'Pelita Air', serviceType: 'Hybrid Carrier', homeBase: 'CGK' },
  { code: 'IU', name: 'Super Air Jet', serviceType: 'Low Cost Carrier', homeBase: 'CGK' },
  { code: 'JT', name: 'Lion Air', serviceType: 'Low Cost Carrier', homeBase: 'SUB' },
  { code: 'IN', name: 'NAM Air', serviceType: 'Full Service Carrier', homeBase: 'CGK' },
  { code: 'QG', name: 'Citilink', serviceType: 'Low Cost Carrier', homeBase: 'CGK' },
  { code: 'SJ', name: 'Sriwijaya Air', serviceType: 'Full Service Carrier', homeBase: 'CGK' },
  { code: '8B', name: 'TransNusa', serviceType: 'Regional Carrier', homeBase: 'CGK' },
];

const COMMODITY_CATEGORIES: CommodityCategoryMaster[] = [
  { code: 'AGRICULTURE', name: 'Produk Pertanian', handlingNotes: 'Perlu ventilasi memadai dan penempatan stabil selama sortasi.' },
  { code: 'APPAREL', name: 'Pakaian Jadi', handlingNotes: 'Jaga kemasan tetap kering dan hindari kompresi berlebih.' },
  { code: 'DOCUMENTS', name: 'Dokumen Penting', handlingNotes: 'Prioritaskan keamanan dan penanganan cepat di area dispatch.' },
  { code: 'ELECTRONICS', name: 'Elektronik', handlingNotes: 'Gunakan handling fragile dan hindari benturan selama pemuatan.' },
  { code: 'FINANCIAL_DOCS', name: 'Dokumen Keuangan', handlingNotes: 'Butuh chain-of-custody yang jelas dan security escort bila diperlukan.' },
  { code: 'FRESH_PRODUCE', name: 'Produk Segar', handlingNotes: 'Gunakan cold chain dan minimalkan dwell time di apron.' },
  { code: 'HOTEL_SUPPLIES', name: 'Perlengkapan Hotel', handlingNotes: 'Kelompokkan per koli sesuai manifest untuk mempermudah serah terima.' },
  { code: 'INDUSTRIAL_MACHINE', name: 'Mesin Industri', handlingNotes: 'Butuh heavy cargo handling dan titik ikat yang tervalidasi.' },
  { code: 'INDUSTRIAL_PARTS', name: 'Suku Cadang Industri', handlingNotes: 'Periksa integritas kemasan dan dukung dengan manifest berat.' },
  { code: 'MINING_SAMPLES', name: 'Sampel Mineral', handlingNotes: 'Pastikan dokumen lab dan pengemasan sample kit lengkap.' },
  { code: 'PHARMACEUTICALS', name: 'Obat-obatan', handlingNotes: 'Wajib cold chain dan pencatatan waktu proses yang disiplin.' },
  { code: 'TEXTILES', name: 'Tekstil', handlingNotes: 'Pastikan kemasan tetap kering dan tersusun rapi di palet.' },
  { code: 'VALUABLES', name: 'Barang Berharga', handlingNotes: 'Gunakan pengamanan khusus dan area penyimpanan terbatas.' },
];

const HANDLING_SERVICES: HandlingServiceMaster[] = [
  { code: 'AWB_DOC_CHECK', name: 'AWB Document Check', description: 'Verifikasi dokumen AWB dan manifest sebelum proses handling.', slaMinutes: 20 },
  { code: 'COLD_CHAIN', name: 'Cold Chain Handling', description: 'Penanganan bersuhu terkontrol untuk komoditas sensitif suhu.', slaMinutes: 30 },
  { code: 'EXPRESS_RELEASE', name: 'Express Release', description: 'Percepatan release setelah shipment tiba di bandara tujuan.', slaMinutes: 25 },
  { code: 'FRAGILE_HANDLING', name: 'Fragile Handling', description: 'Penanganan khusus untuk muatan rapuh atau bernilai tinggi.', slaMinutes: 35 },
  { code: 'HEAVY_CARGO', name: 'Heavy Cargo Handling', description: 'Penanganan alat bantu berat untuk shipment berbobot besar.', slaMinutes: 45 },
  { code: 'HIGH_VALUE', name: 'High Value Storage', description: 'Penyimpanan aman untuk komoditas bernilai tinggi.', slaMinutes: 15 },
  { code: 'LIVE_TRACKING', name: 'Live Tracking Monitoring', description: 'Monitoring status real-time pada shipment prioritas.', slaMinutes: 10 },
  { code: 'PHARMA_HANDLING', name: 'Pharma Handling', description: 'Pengawasan tambahan untuk obat-obatan dan produk farmasi.', slaMinutes: 30 },
  { code: 'PRIORITY_SORTATION', name: 'Priority Sortation', description: 'Prioritas proses sortasi agar shipment segera siap muat.', slaMinutes: 20 },
  { code: 'SECURITY_ESCORT', name: 'Security Escort', description: 'Pendampingan keamanan untuk dokumen sensitif dan valuables.', slaMinutes: 20 },
];

const COMMODITY_TO_CATEGORY_CODE: Record<string, string> = {
  'Buah-buahan': 'FRESH_PRODUCE',
  'Dokumen Keuangan': 'FINANCIAL_DOCS',
  'Dokumen Penting': 'DOCUMENTS',
  'Elektronik': 'ELECTRONICS',
  'Mesin Industri': 'INDUSTRIAL_MACHINE',
  'Obat-obatan': 'PHARMACEUTICALS',
  'Pakaian Jadi': 'APPAREL',
  'Perhiasan': 'VALUABLES',
  'Perlengkapan Hotel': 'HOTEL_SUPPLIES',
  'Produk Pertanian': 'AGRICULTURE',
  'Produk Segar': 'FRESH_PRODUCE',
  'Sampel Mineral': 'MINING_SAMPLES',
  'Spare Parts': 'INDUSTRIAL_PARTS',
  'Suku Cadang Industri': 'INDUSTRIAL_PARTS',
  'Tekstil': 'TEXTILES',
};

function buildUserProfiles(): UserProfileSeed[] {
  const certifications = [
    'Cargo Documentation',
    'Warehouse Operations',
    'Sortation Control',
    'Ramp Safety',
    'Arrival Handling',
    'Manifest Verification',
    'Cold Chain Handling',
    'Pharma Logistics',
    'Supervisor Control',
    'System Administration',
  ];

  const shifts = [
    'Morning Shift',
    'Morning Shift',
    'Midday Shift',
    'Midday Shift',
    'Morning Shift',
    'Evening Shift',
    'Evening Shift',
    'Morning Shift',
    'Night Shift',
    'Office Hours',
  ];

  const emergencyContacts = [
    'Rina Operasional',
    'Budi Warehouse',
    'Lina Kargo',
    'Surya Handling',
    'Sari Arrival',
    'Deni Security',
    'Komang Support',
    'Andi Dispatch',
    'Rahma Control',
    'Nina IT Support',
  ];

  return users.map((user, index) => ({
    userId: user.id,
    employeeNumber: `ATK-${String(user.id).padStart(4, '0')}`,
    phone: `+62-811-900${String(index + 1).padStart(3, '0')}`,
    certification: certifications[index] ?? 'Cargo Operations',
    shiftName: shifts[index] ?? 'Office Hours',
    emergencyContactName: emergencyContacts[index] ?? 'Helpdesk Operasional',
    emergencyContactPhone: `+62-812-700${String(index + 1).padStart(3, '0')}`,
  }));
}

function buildShipmentServices(): ShipmentServiceSeed[] {
  const assignments = new Map<string, ShipmentServiceSeed>();

  const addAssignment = (
    shipmentAwb: string,
    serviceCode: string,
    assignmentNote: string
  ) => {
    const key = `${shipmentAwb}:${serviceCode}`;
    if (!assignments.has(key)) {
      assignments.set(key, { shipmentAwb, serviceCode, assignmentNote });
    }
  };

  for (const shipment of todayShipmentsList) {
    addAssignment(
      shipment.awb,
      'AWB_DOC_CHECK',
      'Dokumen AWB diverifikasi sebelum shipment masuk alur operasional.'
    );

    addAssignment(
      shipment.awb,
      'LIVE_TRACKING',
      'Shipment dimonitor pada dashboard tracking selama siklus pengiriman.'
    );

    if (shipment.currentStatus === 'Received' || shipment.currentStatus === 'Sortation') {
      addAssignment(
        shipment.awb,
        'PRIORITY_SORTATION',
        'Shipment diprioritaskan di area sortasi agar siap muat tepat waktu.'
      );
    }

    if (shipment.currentStatus === 'Arrived') {
      addAssignment(
        shipment.awb,
        'EXPRESS_RELEASE',
        'Shipment tiba dan disiapkan untuk proses release yang lebih cepat.'
      );
    }

    if (
      shipment.commodity === 'Produk Segar' ||
      shipment.commodity === 'Obat-obatan' ||
      shipment.commodity === 'Buah-buahan'
    ) {
      addAssignment(
        shipment.awb,
        'COLD_CHAIN',
        'Shipment memerlukan pengendalian suhu selama warehouse handling.'
      );
    }

    if (shipment.commodity === 'Obat-obatan') {
      addAssignment(
        shipment.awb,
        'PHARMA_HANDLING',
        'Obat-obatan ditangani sesuai SOP farmasi dan time control.'
      );
    }

    if (
      shipment.commodity === 'Mesin Industri' ||
      shipment.commodity === 'Spare Parts' ||
      shipment.commodity === 'Suku Cadang Industri'
    ) {
      addAssignment(
        shipment.awb,
        'HEAVY_CARGO',
        'Komoditas berat memerlukan alat bantu dan penempatan heavy cargo.'
      );
    }

    if (shipment.commodity === 'Elektronik') {
      addAssignment(
        shipment.awb,
        'FRAGILE_HANDLING',
        'Elektronik diproses dengan penanganan fragile untuk mencegah benturan.'
      );
    }

    if (shipment.commodity === 'Perhiasan') {
      addAssignment(
        shipment.awb,
        'HIGH_VALUE',
        'Perhiasan ditempatkan di area penyimpanan bernilai tinggi.'
      );
      addAssignment(
        shipment.awb,
        'SECURITY_ESCORT',
        'Pengamanan tambahan disiapkan selama transfer ke aircraft.'
      );
    }

    if (
      shipment.commodity === 'Dokumen Penting' ||
      shipment.commodity === 'Dokumen Keuangan'
    ) {
      addAssignment(
        shipment.awb,
        'SECURITY_ESCORT',
        'Dokumen sensitif membutuhkan pengawasan berantai selama proses handling.'
      );
    }
  }

  return Array.from(assignments.values());
}

async function existsQuery(
  sql: SqlClient,
  queryText: string,
  params: unknown[]
): Promise<boolean> {
  const [row] = (await sql.query(queryText, params)) as Array<{ exists: boolean }>;
  return Boolean(row?.exists);
}

async function columnExists(
  sql: SqlClient,
  tableName: string,
  columnName: string
): Promise<boolean> {
  return existsQuery(
    sql,
    `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = $1
          AND column_name = $2
      ) AS exists
    `,
    [tableName, columnName]
  );
}

async function constraintExists(
  sql: SqlClient,
  constraintName: string
): Promise<boolean> {
  return existsQuery(
    sql,
    `
      SELECT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = $1
      ) AS exists
    `,
    [constraintName]
  );
}

async function indexExists(sql: SqlClient, indexName: string): Promise<boolean> {
  return existsQuery(
    sql,
    `
      SELECT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND indexname = $1
      ) AS exists
    `,
    [indexName]
  );
}

async function addColumnIfMissing(
  sql: SqlClient,
  tableName: string,
  columnName: string,
  definition: string
) {
  if (await columnExists(sql, tableName, columnName)) {
    return;
  }

  await sql.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
}

async function createIndexIfMissing(
  sql: SqlClient,
  indexName: string,
  statement: string
) {
  if (await indexExists(sql, indexName)) {
    return;
  }

  await sql.query(statement);
}

async function addForeignKeyIfPossible(
  sql: SqlClient,
  warnings: string[],
  config: {
    constraintName: string;
    tableName: string;
    columnName: string;
    referenceTable: string;
    referenceColumn: string;
    onDelete?: 'CASCADE' | 'RESTRICT' | 'SET NULL';
  }
) {
  if (await constraintExists(sql, config.constraintName)) {
    return;
  }

  const [row] = (await sql.query(
    `
      SELECT COUNT(*)::int AS count
      FROM ${config.tableName} AS src
      LEFT JOIN ${config.referenceTable} AS ref
        ON src.${config.columnName} = ref.${config.referenceColumn}
      WHERE src.${config.columnName} IS NOT NULL
        AND ref.${config.referenceColumn} IS NULL
    `
  )) as Array<{ count: number }>;

  if ((row?.count ?? 0) > 0) {
    warnings.push(
      `Foreign key ${config.constraintName} dilewati karena masih ada ${row.count} baris yatim.`
    );
    return;
  }

  const onDelete = config.onDelete ?? 'RESTRICT';

  await sql.query(`
    ALTER TABLE ${config.tableName}
    ADD CONSTRAINT ${config.constraintName}
    FOREIGN KEY (${config.columnName})
    REFERENCES ${config.referenceTable} (${config.referenceColumn})
    ON DELETE ${onDelete}
  `);
}

async function ensureSchema(sql: SqlClient): Promise<string[]> {
  const warnings: string[] = [];

  await sql.query(`
    CREATE TABLE IF NOT EXISTS airports (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      province TEXT NOT NULL,
      cargo_terminal TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS airlines (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      service_type TEXT NOT NULL,
      home_base TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS commodity_categories (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      handling_notes TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS handling_services (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      sla_minutes INT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL,
      airport TEXT NOT NULL,
      last_login TEXT NOT NULL,
      status TEXT NOT NULL
    )
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS flights (
      id TEXT PRIMARY KEY,
      flight_number TEXT NOT NULL UNIQUE,
      airline TEXT NOT NULL,
      origin_code TEXT NOT NULL,
      origin_name TEXT NOT NULL,
      destination_code TEXT NOT NULL,
      destination_name TEXT NOT NULL,
      scheduled_departure TEXT NOT NULL,
      actual_departure TEXT,
      status TEXT NOT NULL,
      cargo_count INT NOT NULL,
      cargo_weight DOUBLE PRECISION NOT NULL
    )
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS shipments (
      awb TEXT PRIMARY KEY,
      shipper TEXT NOT NULL,
      consignee TEXT NOT NULL,
      origin_code TEXT NOT NULL,
      origin_name TEXT NOT NULL,
      destination_code TEXT NOT NULL,
      destination_name TEXT NOT NULL,
      weight DOUBLE PRECISION NOT NULL,
      pieces INT NOT NULL,
      commodity TEXT NOT NULL,
      flight_number TEXT NOT NULL,
      scheduled_departure TEXT NOT NULL,
      current_status TEXT NOT NULL,
      commodity_category_code TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS tracking_events (
      id BIGSERIAL PRIMARY KEY,
      shipment_awb TEXT NOT NULL,
      event_order INT NOT NULL,
      status TEXT NOT NULL,
      event_timestamp TEXT NOT NULL,
      location TEXT NOT NULL,
      officer TEXT NOT NULL,
      note TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      id BIGSERIAL PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      employee_number TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      certification TEXT NOT NULL,
      shift_name TEXT NOT NULL,
      emergency_contact_name TEXT NOT NULL,
      emergency_contact_phone TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS shipment_services (
      shipment_awb TEXT NOT NULL,
      service_code TEXT NOT NULL,
      assignment_note TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (shipment_awb, service_code)
    )
  `);

  await addColumnIfMissing(
    sql,
    'users',
    'created_at',
    'TIMESTAMPTZ NOT NULL DEFAULT NOW()'
  );
  await addColumnIfMissing(
    sql,
    'users',
    'updated_at',
    'TIMESTAMPTZ NOT NULL DEFAULT NOW()'
  );
  await addColumnIfMissing(
    sql,
    'flights',
    'created_at',
    'TIMESTAMPTZ NOT NULL DEFAULT NOW()'
  );
  await addColumnIfMissing(
    sql,
    'flights',
    'updated_at',
    'TIMESTAMPTZ NOT NULL DEFAULT NOW()'
  );
  await addColumnIfMissing(
    sql,
    'shipments',
    'commodity_category_code',
    'TEXT'
  );

  await createIndexIfMissing(
    sql,
    'users_email_key',
    'CREATE UNIQUE INDEX users_email_key ON users (email)'
  );
  await createIndexIfMissing(
    sql,
    'flights_flight_number_key',
    'CREATE UNIQUE INDEX flights_flight_number_key ON flights (flight_number)'
  );
  await createIndexIfMissing(
    sql,
    'tracking_events_shipment_awb_event_order_key',
    'CREATE UNIQUE INDEX tracking_events_shipment_awb_event_order_key ON tracking_events (shipment_awb, event_order)'
  );
  await createIndexIfMissing(
    sql,
    'shipments_current_status_idx',
    'CREATE INDEX shipments_current_status_idx ON shipments (current_status)'
  );
  await createIndexIfMissing(
    sql,
    'shipments_flight_number_idx',
    'CREATE INDEX shipments_flight_number_idx ON shipments (flight_number)'
  );
  await createIndexIfMissing(
    sql,
    'shipments_commodity_category_code_idx',
    'CREATE INDEX shipments_commodity_category_code_idx ON shipments (commodity_category_code)'
  );
  await createIndexIfMissing(
    sql,
    'tracking_events_shipment_awb_idx',
    'CREATE INDEX tracking_events_shipment_awb_idx ON tracking_events (shipment_awb)'
  );
  await createIndexIfMissing(
    sql,
    'tracking_events_status_idx',
    'CREATE INDEX tracking_events_status_idx ON tracking_events (status)'
  );
  await createIndexIfMissing(
    sql,
    'flights_status_idx',
    'CREATE INDEX flights_status_idx ON flights (status)'
  );
  await createIndexIfMissing(
    sql,
    'shipment_services_service_code_idx',
    'CREATE INDEX shipment_services_service_code_idx ON shipment_services (service_code)'
  );

  await addForeignKeyIfPossible(sql, warnings, {
    constraintName: 'airlines_home_base_fkey',
    tableName: 'airlines',
    columnName: 'home_base',
    referenceTable: 'airports',
    referenceColumn: 'code',
  });
  await addForeignKeyIfPossible(sql, warnings, {
    constraintName: 'flights_airline_fkey',
    tableName: 'flights',
    columnName: 'airline',
    referenceTable: 'airlines',
    referenceColumn: 'name',
  });
  await addForeignKeyIfPossible(sql, warnings, {
    constraintName: 'flights_origin_code_fkey',
    tableName: 'flights',
    columnName: 'origin_code',
    referenceTable: 'airports',
    referenceColumn: 'code',
  });
  await addForeignKeyIfPossible(sql, warnings, {
    constraintName: 'flights_destination_code_fkey',
    tableName: 'flights',
    columnName: 'destination_code',
    referenceTable: 'airports',
    referenceColumn: 'code',
  });
  await addForeignKeyIfPossible(sql, warnings, {
    constraintName: 'shipments_origin_code_fkey',
    tableName: 'shipments',
    columnName: 'origin_code',
    referenceTable: 'airports',
    referenceColumn: 'code',
  });
  await addForeignKeyIfPossible(sql, warnings, {
    constraintName: 'shipments_destination_code_fkey',
    tableName: 'shipments',
    columnName: 'destination_code',
    referenceTable: 'airports',
    referenceColumn: 'code',
  });
  await addForeignKeyIfPossible(sql, warnings, {
    constraintName: 'shipments_flight_number_fkey',
    tableName: 'shipments',
    columnName: 'flight_number',
    referenceTable: 'flights',
    referenceColumn: 'flight_number',
  });
  await addForeignKeyIfPossible(sql, warnings, {
    constraintName: 'shipments_commodity_category_code_fkey',
    tableName: 'shipments',
    columnName: 'commodity_category_code',
    referenceTable: 'commodity_categories',
    referenceColumn: 'code',
    onDelete: 'SET NULL',
  });
  await addForeignKeyIfPossible(sql, warnings, {
    constraintName: 'tracking_events_shipment_awb_fkey',
    tableName: 'tracking_events',
    columnName: 'shipment_awb',
    referenceTable: 'shipments',
    referenceColumn: 'awb',
    onDelete: 'CASCADE',
  });
  await addForeignKeyIfPossible(sql, warnings, {
    constraintName: 'user_profiles_user_id_fkey',
    tableName: 'user_profiles',
    columnName: 'user_id',
    referenceTable: 'users',
    referenceColumn: 'id',
    onDelete: 'CASCADE',
  });
  await addForeignKeyIfPossible(sql, warnings, {
    constraintName: 'shipment_services_shipment_awb_fkey',
    tableName: 'shipment_services',
    columnName: 'shipment_awb',
    referenceTable: 'shipments',
    referenceColumn: 'awb',
    onDelete: 'CASCADE',
  });
  await addForeignKeyIfPossible(sql, warnings, {
    constraintName: 'shipment_services_service_code_fkey',
    tableName: 'shipment_services',
    columnName: 'service_code',
    referenceTable: 'handling_services',
    referenceColumn: 'code',
    onDelete: 'CASCADE',
  });

  return warnings;
}

async function seedMasterTables(sql: SqlClient) {
  for (const airport of AIRPORTS) {
    await sql`
      INSERT INTO airports (
        code,
        name,
        city,
        province,
        cargo_terminal
      )
      VALUES (
        ${airport.code},
        ${airport.name},
        ${airport.city},
        ${airport.province},
        ${airport.cargoTerminal}
      )
      ON CONFLICT (code) DO UPDATE SET
        name = EXCLUDED.name,
        city = EXCLUDED.city,
        province = EXCLUDED.province,
        cargo_terminal = EXCLUDED.cargo_terminal
    `;
  }

  for (const airline of AIRLINES) {
    await sql`
      INSERT INTO airlines (
        code,
        name,
        service_type,
        home_base
      )
      VALUES (
        ${airline.code},
        ${airline.name},
        ${airline.serviceType},
        ${airline.homeBase}
      )
      ON CONFLICT (code) DO UPDATE SET
        name = EXCLUDED.name,
        service_type = EXCLUDED.service_type,
        home_base = EXCLUDED.home_base
    `;
  }

  for (const category of COMMODITY_CATEGORIES) {
    await sql`
      INSERT INTO commodity_categories (
        code,
        name,
        handling_notes
      )
      VALUES (
        ${category.code},
        ${category.name},
        ${category.handlingNotes}
      )
      ON CONFLICT (code) DO UPDATE SET
        name = EXCLUDED.name,
        handling_notes = EXCLUDED.handling_notes
    `;
  }

  for (const service of HANDLING_SERVICES) {
    await sql`
      INSERT INTO handling_services (
        code,
        name,
        description,
        sla_minutes
      )
      VALUES (
        ${service.code},
        ${service.name},
        ${service.description},
        ${service.slaMinutes}
      )
      ON CONFLICT (code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        sla_minutes = EXCLUDED.sla_minutes
    `;
  }
}

async function seedUsers(sql: SqlClient) {
  for (const user of users) {
    await sql`
      INSERT INTO users (
        id,
        name,
        email,
        role,
        airport,
        last_login,
        status,
        updated_at
      )
      VALUES (
        ${user.id},
        ${user.name},
        ${user.email},
        ${user.role},
        ${user.airport},
        ${user.lastLogin},
        ${user.status},
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        airport = EXCLUDED.airport,
        last_login = EXCLUDED.last_login,
        status = EXCLUDED.status,
        updated_at = NOW()
    `;
  }
}

async function seedUserProfiles(sql: SqlClient) {
  for (const profile of buildUserProfiles()) {
    await sql`
      INSERT INTO user_profiles (
        user_id,
        employee_number,
        phone,
        certification,
        shift_name,
        emergency_contact_name,
        emergency_contact_phone,
        updated_at
      )
      VALUES (
        ${profile.userId},
        ${profile.employeeNumber},
        ${profile.phone},
        ${profile.certification},
        ${profile.shiftName},
        ${profile.emergencyContactName},
        ${profile.emergencyContactPhone},
        NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        employee_number = EXCLUDED.employee_number,
        phone = EXCLUDED.phone,
        certification = EXCLUDED.certification,
        shift_name = EXCLUDED.shift_name,
        emergency_contact_name = EXCLUDED.emergency_contact_name,
        emergency_contact_phone = EXCLUDED.emergency_contact_phone,
        updated_at = NOW()
    `;
  }
}

async function seedFlights(sql: SqlClient) {
  for (const flight of flights) {
    await sql`
      INSERT INTO flights (
        id,
        flight_number,
        airline,
        origin_code,
        origin_name,
        destination_code,
        destination_name,
        scheduled_departure,
        actual_departure,
        status,
        cargo_count,
        cargo_weight,
        updated_at
      )
      VALUES (
        ${flight.id},
        ${flight.flightNumber},
        ${flight.airline},
        ${flight.origin.code},
        ${flight.origin.name},
        ${flight.destination.code},
        ${flight.destination.name},
        ${flight.scheduledDeparture},
        ${flight.actualDeparture},
        ${flight.status},
        ${flight.cargoCount},
        ${flight.cargoWeight},
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        flight_number = EXCLUDED.flight_number,
        airline = EXCLUDED.airline,
        origin_code = EXCLUDED.origin_code,
        origin_name = EXCLUDED.origin_name,
        destination_code = EXCLUDED.destination_code,
        destination_name = EXCLUDED.destination_name,
        scheduled_departure = EXCLUDED.scheduled_departure,
        actual_departure = EXCLUDED.actual_departure,
        status = EXCLUDED.status,
        cargo_count = EXCLUDED.cargo_count,
        cargo_weight = EXCLUDED.cargo_weight,
        updated_at = NOW()
    `;
  }
}

async function seedShipments(sql: SqlClient) {
  for (const shipment of todayShipmentsList) {
    await sql`
      INSERT INTO shipments (
        awb,
        shipper,
        consignee,
        origin_code,
        origin_name,
        destination_code,
        destination_name,
        weight,
        pieces,
        commodity,
        flight_number,
        scheduled_departure,
        current_status,
        commodity_category_code,
        updated_at
      )
      VALUES (
        ${shipment.awb},
        ${shipment.shipper},
        ${shipment.consignee},
        ${shipment.origin.code},
        ${shipment.origin.name},
        ${shipment.destination.code},
        ${shipment.destination.name},
        ${shipment.weight},
        ${shipment.pieces},
        ${shipment.commodity},
        ${shipment.flightNumber},
        ${shipment.scheduledDeparture},
        ${shipment.currentStatus},
        ${COMMODITY_TO_CATEGORY_CODE[shipment.commodity] ?? null},
        NOW()
      )
      ON CONFLICT (awb) DO UPDATE SET
        shipper = EXCLUDED.shipper,
        consignee = EXCLUDED.consignee,
        origin_code = EXCLUDED.origin_code,
        origin_name = EXCLUDED.origin_name,
        destination_code = EXCLUDED.destination_code,
        destination_name = EXCLUDED.destination_name,
        weight = EXCLUDED.weight,
        pieces = EXCLUDED.pieces,
        commodity = EXCLUDED.commodity,
        flight_number = EXCLUDED.flight_number,
        scheduled_departure = EXCLUDED.scheduled_departure,
        current_status = EXCLUDED.current_status,
        commodity_category_code = EXCLUDED.commodity_category_code,
        updated_at = NOW()
    `;
  }
}

async function seedTrackingEvents(sql: SqlClient) {
  for (const shipment of todayShipmentsList) {
    for (const [index, event] of shipment.tracking.entries()) {
      await sql`
        INSERT INTO tracking_events (
          shipment_awb,
          event_order,
          status,
          event_timestamp,
          location,
          officer,
          note
        )
        VALUES (
          ${shipment.awb},
          ${index + 1},
          ${event.status},
          ${event.timestamp},
          ${event.location},
          ${event.officer},
          ${event.note}
        )
        ON CONFLICT (shipment_awb, event_order) DO UPDATE SET
          status = EXCLUDED.status,
          event_timestamp = EXCLUDED.event_timestamp,
          location = EXCLUDED.location,
          officer = EXCLUDED.officer,
          note = EXCLUDED.note
      `;
    }
  }
}

async function seedShipmentServices(sql: SqlClient) {
  for (const assignment of buildShipmentServices()) {
    await sql`
      INSERT INTO shipment_services (
        shipment_awb,
        service_code,
        assignment_note
      )
      VALUES (
        ${assignment.shipmentAwb},
        ${assignment.serviceCode},
        ${assignment.assignmentNote}
      )
      ON CONFLICT (shipment_awb, service_code) DO UPDATE SET
        assignment_note = EXCLUDED.assignment_note
    `;
  }
}

async function getConnectionInfo(sql: SqlClient): Promise<ConnectionInfo> {
  const [row] = (await sql.query(`
    SELECT
      current_database() AS database_name,
      current_setting('neon.branch_id', true) AS branch_id,
      current_setting('neon.branch_name', true) AS branch_name,
      current_setting('neon.endpoint_id', true) AS endpoint_id,
      NOW()::text AS checked_at
  `)) as Array<{
    database_name: string;
    branch_id: string | null;
    branch_name: string | null;
    endpoint_id: string | null;
    checked_at: string;
  }>;

  return {
    databaseName: row?.database_name ?? '',
    branchId: row?.branch_id ?? null,
    branchName: row?.branch_name ?? null,
    endpointId: row?.endpoint_id ?? null,
    checkedAt: row?.checked_at ?? '',
  };
}

async function getTableCount(sql: SqlClient, tableName: string): Promise<number> {
  const [row] = (await sql`
    SELECT COUNT(*)::int AS count
    FROM ${sql.unsafe(tableName)}
  `) as Array<{ count: number }>;

  return row?.count ?? 0;
}

async function getProjectTableCounts(sql: SqlClient): Promise<TableCount[]> {
  return Promise.all(
    PROJECT_TABLES.map(async (tableName) => ({
      table: tableName,
      count: await getTableCount(sql, tableName),
    }))
  );
}

async function getPublicTableNames(sql: SqlClient): Promise<string[]> {
  const rows = (await sql.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `)) as Array<{ table_name: string }>;

  return rows.map((row) => row.table_name);
}

async function getOrphanChecks(sql: SqlClient): Promise<OrphanCheck[]> {
  const checks: Array<{
    relation: string;
    query: string;
  }> = [
    {
      relation: 'flights.airline -> airlines.name',
      query: `
        SELECT COUNT(*)::int AS count
        FROM flights f
        LEFT JOIN airlines a ON f.airline = a.name
        WHERE a.name IS NULL
      `,
    },
    {
      relation: 'flights.origin_code -> airports.code',
      query: `
        SELECT COUNT(*)::int AS count
        FROM flights f
        LEFT JOIN airports a ON f.origin_code = a.code
        WHERE a.code IS NULL
      `,
    },
    {
      relation: 'shipments.flight_number -> flights.flight_number',
      query: `
        SELECT COUNT(*)::int AS count
        FROM shipments s
        LEFT JOIN flights f ON s.flight_number = f.flight_number
        WHERE f.flight_number IS NULL
      `,
    },
    {
      relation: 'shipments.commodity_category_code -> commodity_categories.code',
      query: `
        SELECT COUNT(*)::int AS count
        FROM shipments s
        LEFT JOIN commodity_categories c
          ON s.commodity_category_code = c.code
        WHERE s.commodity_category_code IS NOT NULL
          AND c.code IS NULL
      `,
    },
    {
      relation: 'tracking_events.shipment_awb -> shipments.awb',
      query: `
        SELECT COUNT(*)::int AS count
        FROM tracking_events te
        LEFT JOIN shipments s ON te.shipment_awb = s.awb
        WHERE s.awb IS NULL
      `,
    },
    {
      relation: 'user_profiles.user_id -> users.id',
      query: `
        SELECT COUNT(*)::int AS count
        FROM user_profiles up
        LEFT JOIN users u ON up.user_id = u.id
        WHERE u.id IS NULL
      `,
    },
    {
      relation: 'shipment_services.service_code -> handling_services.code',
      query: `
        SELECT COUNT(*)::int AS count
        FROM shipment_services ss
        LEFT JOIN handling_services hs ON ss.service_code = hs.code
        WHERE hs.code IS NULL
      `,
    },
  ];

  return Promise.all(
    checks.map(async (check) => {
      const [row] = (await sql.query(check.query)) as Array<{ count: number }>;
      return {
        relation: check.relation,
        missingRows: row?.count ?? 0,
      };
    })
  );
}

async function getRelationSamples(sql: SqlClient) {
  const oneToManyFlightsToShipments = (await sql.query(`
    SELECT
      f.flight_number,
      f.airline,
      COUNT(s.awb)::int AS shipment_count
    FROM flights f
    JOIN shipments s ON s.flight_number = f.flight_number
    GROUP BY f.flight_number, f.airline
    ORDER BY shipment_count DESC, f.flight_number
    LIMIT 10
  `)) as Array<{
    flight_number: string;
    airline: string;
    shipment_count: number;
  }>;

  const oneToManyShipmentsToTrackingEvents = (await sql.query(`
    SELECT
      s.awb,
      s.shipper,
      COUNT(te.id)::int AS tracking_count
    FROM shipments s
    JOIN tracking_events te ON te.shipment_awb = s.awb
    GROUP BY s.awb, s.shipper
    ORDER BY tracking_count DESC, s.awb
    LIMIT 10
  `)) as Array<{
    awb: string;
    shipper: string;
    tracking_count: number;
  }>;

  const oneToOneUsersToProfiles = (await sql.query(`
    SELECT
      u.id AS user_id,
      u.name,
      up.employee_number,
      up.shift_name
    FROM users u
    JOIN user_profiles up ON up.user_id = u.id
    ORDER BY u.id
    LIMIT 10
  `)) as Array<{
    user_id: number;
    name: string;
    employee_number: string;
    shift_name: string;
  }>;

  const manyToManyShipmentsToServices = (await sql.query(`
    SELECT
      s.awb,
      s.commodity,
      hs.name AS service_name
    FROM shipment_services ss
    JOIN shipments s ON ss.shipment_awb = s.awb
    JOIN handling_services hs ON ss.service_code = hs.code
    ORDER BY s.awb, hs.name
    LIMIT 20
  `)) as Array<{
    awb: string;
    commodity: string;
    service_name: string;
  }>;

  return {
    oneToManyFlightsToShipments,
    oneToManyShipmentsToTrackingEvents,
    oneToOneUsersToProfiles,
    manyToManyShipmentsToServices,
  };
}

async function getMasterDataSamples(sql: SqlClient) {
  const airports = (await sql.query(`
    SELECT code, name, city
    FROM airports
    ORDER BY code
    LIMIT 10
  `)) as Array<{ code: string; name: string; city: string }>;

  const airlines = (await sql.query(`
    SELECT code, name
    FROM airlines
    ORDER BY code
    LIMIT 10
  `)) as Array<{ code: string; name: string }>;

  const commodityCategories = (await sql.query(`
    SELECT code, name
    FROM commodity_categories
    ORDER BY code
    LIMIT 10
  `)) as Array<{ code: string; name: string }>;

  const handlingServices = (await sql.query(`
    SELECT code, name
    FROM handling_services
    ORDER BY code
    LIMIT 10
  `)) as Array<{ code: string; name: string }>;

  return {
    airports,
    airlines,
    commodityCategories,
    handlingServices,
  };
}

async function getShipmentOverview(sql: SqlClient) {
  return (await sql.query(`
    WITH latest_tracking AS (
      SELECT DISTINCT ON (shipment_awb)
        shipment_awb,
        location,
        event_timestamp
      FROM tracking_events
      ORDER BY shipment_awb, event_order DESC
    )
    SELECT
      s.awb,
      s.shipper,
      s.consignee,
      s.current_status,
      s.flight_number,
      f.airline,
      CONCAT(s.origin_code, ' -> ', s.destination_code) AS route,
      lt.location AS latest_location,
      lt.event_timestamp AS latest_timestamp,
      COUNT(te.id)::int AS tracking_event_count
    FROM shipments s
    LEFT JOIN flights f ON s.flight_number = f.flight_number
    LEFT JOIN latest_tracking lt ON s.awb = lt.shipment_awb
    LEFT JOIN tracking_events te ON s.awb = te.shipment_awb
    GROUP BY
      s.awb,
      s.shipper,
      s.consignee,
      s.current_status,
      s.flight_number,
      f.airline,
      s.origin_code,
      s.destination_code,
      lt.location,
      lt.event_timestamp
    ORDER BY s.awb
    LIMIT 10
  `)) as Array<{
    awb: string;
    shipper: string;
    consignee: string;
    current_status: string;
    flight_number: string;
    airline: string;
    route: string;
    latest_location: string | null;
    latest_timestamp: string | null;
    tracking_event_count: number;
  }>;
}

export async function getDatabaseValidationReport(
  existingSql?: SqlClient
): Promise<SetupReport> {
  const sql = existingSql ?? getSqlClient();
  const connection = await getConnectionInfo(sql);
  const projectTables = await getProjectTableCounts(sql);
  const publicTables = await getPublicTableNames(sql);
  const projectTableSet = new Set<string>(PROJECT_TABLES);
  const emptyProjectTables = projectTables
    .filter((table) => table.count === 0)
    .map((table) => table.table);

  const emptyPublicTables: string[] = [];
  for (const tableName of publicTables) {
    if ((await getTableCount(sql, tableName)) === 0) {
      emptyPublicTables.push(tableName);
    }
  }

  return {
    connection,
    masterTables: [...MASTER_TABLES],
    transactionTables: [...TRANSACTION_TABLES],
    junctionTables: [...JUNCTION_TABLES],
    projectTables,
    emptyProjectTables,
    emptyPublicTables,
    nonProjectTables: publicTables.filter((tableName) => !projectTableSet.has(tableName)),
    orphanChecks: await getOrphanChecks(sql),
    relationSamples: await getRelationSamples(sql),
    masterDataSamples: await getMasterDataSamples(sql),
    shipmentOverview: await getShipmentOverview(sql),
    warnings: [],
  };
}

export async function setupProjectDatabase(): Promise<SetupReport> {
  const sql = getSqlClient();
  const warnings = await ensureSchema(sql);

  await seedMasterTables(sql);
  await seedUsers(sql);
  await seedUserProfiles(sql);
  await seedFlights(sql);
  await seedShipments(sql);
  await seedTrackingEvents(sql);
  await seedShipmentServices(sql);

  const report = await getDatabaseValidationReport(sql);
  return {
    ...report,
    warnings: [...new Set([...warnings, ...report.warnings])],
  };
}
