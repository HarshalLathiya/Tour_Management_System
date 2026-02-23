import pool from "./db";
import bcrypt from "bcryptjs";

async function seed() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    console.log("🌱 Seeding database...\n");

    // ─── Clear existing data (order matters for FK constraints) ───────────────
    await client.query(`
      TRUNCATE TABLE
        audit_logs, report_files, expenses, budgets,
        attendance, incidents, safety_protocols,
        itineraries, checkpoints, routes,
        announcements, places, cities, states,
        tours, users
      RESTART IDENTITY CASCADE
    `);
    console.log("✓ Cleared existing data");

    // ─── Users ────────────────────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash("password123", 10);

    const usersResult = await client.query(
      `INSERT INTO users (email, password_hash, name, role) VALUES
        ('admin@toursync.com',   $1, 'Admin One',    'admin'),
        ('admin2@toursync.com',  $1, 'Manager Two',    'admin'),
        ('guide1@toursync.com',  $1, 'Paras Thummar',   'guide'),
        ('guide2@toursync.com',  $1, 'Vipul Baldha',   'guide'),
        ('guide3@toursync.com',  $1, 'Dhruvil Padsala',    'guide'),
        ('tourist1@toursync.com',$1, 'Harshal Lathiya',       'tourist'),
        ('tourist2@toursync.com',$1, 'Dharmik Saraviya',     'tourist'),
        ('tourist3@toursync.com',$1, 'Navdeep Bhalu',  'tourist'),
        ('tourist4@toursync.com',$1, 'Deep Kanjariya',       'tourist'),
        ('tourist5@toursync.com',$1, 'Vishal Makawana',   'tourist')
      RETURNING id, email, role`,
      [passwordHash]
    );
    const users = usersResult.rows;
    const [admin1, , guide1, guide2, guide3, tourist1, tourist2, tourist3, tourist4, tourist5] =
      users;
    console.log(`✓ Created ${users.length} users`);

    // ─── States ───────────────────────────────────────────────────────────────
    const statesResult = await client.query(
      `INSERT INTO states (name, code) VALUES
        ('Gujarat',          'GJ'),
        ('Rajasthan',        'RJ'),
        ('Maharashtra',      'MH'),
        ('Kerala',           'KL'),
        ('Himachal Pradesh', 'HP')
      RETURNING id, name`
    );
    const [gujarat, rajasthan, maharashtra, kerala, himachal] = statesResult.rows;
    console.log(`✓ Created ${statesResult.rows.length} states`);

    // ─── Cities ───────────────────────────────────────────────────────────────
    const citiesResult = await client.query(
      `INSERT INTO cities (name, state_id) VALUES
        ('Ahmedabad',  $1),
        ('Surat',      $1),
        ('Jaipur',     $2),
        ('Udaipur',    $2),
        ('Mumbai',     $3),
        ('Pune',       $3),
        ('Kochi',      $4),
        ('Munnar',     $4),
        ('Shimla',     $5),
        ('Manali',     $5),
        ('Gandhinagar',$1),
        ('Jodhpur',    $2)
      RETURNING id, name`,
      [gujarat.id, rajasthan.id, maharashtra.id, kerala.id, himachal.id]
    );
    const [ahmedabad, , jaipur, udaipur, mumbai, , kochi, munnar, shimla, manali] =
      citiesResult.rows;
    console.log(`✓ Created ${citiesResult.rows.length} cities`);

    // ─── Places ───────────────────────────────────────────────────────────────
    const placesResult = await client.query(
      `INSERT INTO places (name, city_id, latitude, longitude, description, category) VALUES
        ('Sabarmati Ashram',      $1, 23.0607, 72.5804, 'Historic ashram of Mahatma Gandhi',         'HISTORICAL'),
        ('Akshardham Temple',     $1, 23.0225, 72.5870, 'Magnificent Hindu temple complex',           'RELIGIOUS'),
        ('Hawa Mahal',            $2, 26.9239, 75.8267, 'Palace of Winds — iconic Jaipur landmark',  'HISTORICAL'),
        ('Amber Fort',            $2, 26.9855, 75.8513, 'Majestic hill fort overlooking Jaipur',     'HISTORICAL'),
        ('Lake Pichola',          $3, 24.5764, 73.6822, 'Scenic lake in the heart of Udaipur',       'NATURAL'),
        ('City Palace Udaipur',   $3, 24.5764, 73.6876, 'Royal palace on the banks of Lake Pichola', 'HISTORICAL'),
        ('Gateway of India',      $4, 18.9220, 72.8347, 'Iconic monument overlooking the Arabian Sea','HISTORICAL'),
        ('Marine Drive',          $4, 18.9438, 72.8231, 'Scenic promenade along Mumbai coastline',   'ENTERTAINMENT'),
        ('Fort Kochi',            $5, 9.9668,  76.2430, 'Historic colonial area in Kochi',           'HISTORICAL'),
        ('Chinese Fishing Nets',  $5, 9.9677,  76.2417, 'Traditional cantilevered fishing nets',     'CULTURAL'),
        ('Eravikulam NP',         $6, 10.1667, 77.0833, 'National park home to Nilgiri Tahr',        'NATURAL'),
        ('Tea Gardens Munnar',    $6, 10.0892, 77.0595, 'Lush green tea plantations',                'NATURAL'),
        ('The Ridge Shimla',      $7, 31.1048, 77.1734, 'Open space in the heart of Shimla',         'ENTERTAINMENT'),
        ('Rohtang Pass',          $8, 32.3686, 77.2375, 'High mountain pass near Manali',            'NATURAL'),
        ('Solang Valley',         $8, 32.3235, 77.1538, 'Beautiful valley for adventure sports',     'NATURAL')
      RETURNING id, name`,
      [ahmedabad.id, jaipur.id, udaipur.id, mumbai.id, kochi.id, munnar.id, shimla.id, manali.id]
    );
    console.log(`✓ Created ${placesResult.rows.length} places`);

    // ─── Tours ────────────────────────────────────────────────────────────────
    const toursResult = await client.query(
      `INSERT INTO tours (name, description, start_date, end_date, destination, price, status, created_by, assigned_leader_id, participant_count) VALUES
        ('Golden Triangle Tour',     'Explore Delhi, Agra and Jaipur — India''s most iconic triangle', '2026-03-01', '2026-03-10', 'Jaipur',     1200.00, 'planned',   $1, $2, 12),
        ('Gujarat Heritage Tour',    'Discover the rich culture and heritage of Gujarat',               '2026-03-15', '2026-03-22', 'Ahmedabad',   950.00, 'planned',   $1, $3, 8),
        ('Kerala Backwaters',        'Serene houseboat journey through Kerala''s backwaters',           '2026-04-01', '2026-04-08', 'Kochi',      1100.00, 'planned',   $1, $2, 15),
        ('Rajasthan Royal Tour',     'Experience the royal heritage of Rajasthan palaces and forts',   '2026-04-10', '2026-04-18', 'Udaipur',    1350.00, 'planned',   $1, $3, 10),
        ('Himachal Adventure',       'Trekking and adventure sports in the Himalayas',                 '2026-05-01', '2026-05-10', 'Manali',     1500.00, 'planned',   $1, $4, 6),
        ('Mumbai City Tour',         'Fast-paced city tour covering Mumbai''s iconic landmarks',       '2026-02-20', '2026-02-25', 'Mumbai',      800.00, 'ongoing',   $1, $2, 20),
        ('Munnar Tea Tour',          'Walk through lush tea gardens and misty hills of Munnar',        '2026-01-10', '2026-01-15', 'Munnar',      700.00, 'completed', $1, $3, 14),
        ('Shimla Winter Escape',     'Scenic hill station tour with snow activities in Shimla',        '2026-01-20', '2026-01-28', 'Shimla',      900.00, 'completed', $1, $4, 9),
        ('Udaipur Lake Festival',    'Special tour coinciding with the Lake Festival of Udaipur',      '2026-06-01', '2026-06-07', 'Udaipur',    1050.00, 'planned',   $1, $2, 0),
        ('South India Circuit',      'Comprehensive tour covering Chennai, Mysore and Ooty',           '2026-06-15', '2026-06-25', 'Chennai',    1600.00, 'cancelled', $1, $3, 0)
      RETURNING id, name`,
      [admin1.id, guide1.id, guide2.id, guide3.id]
    );
    const tours = toursResult.rows;
    console.log(`✓ Created ${tours.length} tours`);

    // ─── Announcements ────────────────────────────────────────────────────────
    await client.query(
      `INSERT INTO announcements (title, content, tour_id) VALUES
        ('Welcome to Golden Triangle Tour',  'Welcome aboard! Please carry valid ID proof and comfortable walking shoes.',     $1),
        ('Itinerary Update',                 'Day 3 visit to Agra Fort has been rescheduled to morning 8 AM.',                 $1),
        ('Gujarat Tour Briefing',            'Pre-tour briefing scheduled for Feb 28th at 6 PM at Hotel Lobby.',               $2),
        ('Kerala Houseboat Rules',           'No alcohol on the houseboat. Life jackets must be worn on deck at all times.',   $3),
        ('Rajasthan Tour Update',            'Camel safari added to day 4 itinerary at no extra cost!',                       $4),
        ('Himachal Adventure Safety Brief',  'Mandatory safety briefing on Day 1. Medical certificates required.',             $5),
        ('Mumbai Tour — Meeting Point',      'Meet at CST station entrance at 9 AM sharp tomorrow.',                          $6),
        ('Mumbai Tour Day 2 Update',         'Marine Drive walk postponed to evening due to weather.',                        $6),
        ('Munnar Tour Completed',            'Thank you for joining! Photos from the tour have been shared.',                  $7),
        ('Shimla Tour Feedback',             'Please fill the feedback form sent to your email. Your feedback matters!',       $8)`,
      [
        tours[0].id,
        tours[1].id,
        tours[2].id,
        tours[3].id,
        tours[4].id,
        tours[5].id,
        tours[6].id,
        tours[7].id,
      ]
    );
    console.log("✓ Created 10 announcements");

    // ─── Budgets ──────────────────────────────────────────────────────────────
    await client.query(
      `INSERT INTO budgets (tour_id, total_amount, spent_amount, per_participant_fee, currency, description) VALUES
        ($1,  14400.00,  5200.00, 1200.00, 'USD', 'Golden Triangle Tour budget'),
        ($2,   7600.00,  1800.00,  950.00, 'USD', 'Gujarat Heritage Tour budget'),
        ($3,  16500.00,  4100.00, 1100.00, 'USD', 'Kerala Backwaters budget'),
        ($4,  13500.00,  2900.00, 1350.00, 'USD', 'Rajasthan Royal Tour budget'),
        ($5,   9000.00,  1200.00, 1500.00, 'USD', 'Himachal Adventure budget'),
        ($6,  16000.00, 12300.00,  800.00, 'USD', 'Mumbai City Tour budget'),
        ($7,   9800.00,  9800.00,  700.00, 'USD', 'Munnar Tea Tour budget — completed'),
        ($8,   8100.00,  8100.00,  900.00, 'USD', 'Shimla Winter Escape budget — completed'),
        ($9,      0.00,     0.00, 1050.00, 'USD', 'Udaipur Lake Festival budget — pending'),
        ($10,     0.00,     0.00, 1600.00, 'USD', 'South India Circuit — cancelled')`,
      tours.map((t) => t.id)
    );
    console.log("✓ Created 10 budgets");

    // ─── Expenses ─────────────────────────────────────────────────────────────
    const expenseData = [
      [tours[0].id, 1800.0, "TRANSPORT", "Bus rental for Delhi-Agra-Jaipur"],
      [tours[0].id, 2400.0, "ACCOMMODATION", "Hotel booking - 3 nights"],
      [tours[0].id, 800.0, "FOOD", "Group meals - Day 1 to 3"],
      [tours[0].id, 200.0, "MISC", "Entry tickets to monuments"],
      [tours[1].id, 900.0, "TRANSPORT", "AC coach from Ahmedabad to Surat"],
      [tours[1].id, 600.0, "ACCOMMODATION", "Heritage hotel - 2 nights"],
      [tours[1].id, 300.0, "FOOD", "Traditional Gujarati thali meals"],
      [tours[2].id, 1500.0, "ACCOMMODATION", "Houseboat stay - 4 nights"],
      [tours[2].id, 1800.0, "TRANSPORT", "Flight Bangalore to Kochi"],
      [tours[2].id, 800.0, "FOOD", "Seafood and local cuisine"],
      [tours[3].id, 1200.0, "ACCOMMODATION", "Lake-view hotel - 4 nights"],
      [tours[3].id, 900.0, "TRANSPORT", "Private cab for fort visits"],
      [tours[3].id, 800.0, "FOOD", "Rajasthani cuisine dinners"],
      [tours[4].id, 700.0, "TRANSPORT", "Cab from Chandigarh to Manali"],
      [tours[4].id, 500.0, "MISC", "Trek guide and equipment rental"],
      [tours[5].id, 4000.0, "ACCOMMODATION", "Business hotel - 5 nights"],
      [tours[5].id, 3500.0, "TRANSPORT", "Local transport and taxi"],
      [tours[5].id, 2800.0, "FOOD", "Meals and restaurant bookings"],
      [tours[5].id, 2000.0, "MISC", "Entry fees and guided tours"],
      [tours[6].id, 9800.0, "MISC", "All-inclusive tea estate package"],
    ];
    for (const [tid, amount, category, desc] of expenseData) {
      await client.query(
        `INSERT INTO expenses (tour_id, amount, category, description) VALUES ($1, $2, $3, $4)`,
        [tid, amount, category, desc]
      );
    }
    console.log(`✓ Created ${expenseData.length} expenses`);

    // ─── Attendance ───────────────────────────────────────────────────────────
    const attendanceData = [
      [tourist1.id, tours[5].id, "2026-02-20", "present"],
      [tourist2.id, tours[5].id, "2026-02-20", "present"],
      [tourist3.id, tours[5].id, "2026-02-20", "present"],
      [tourist4.id, tours[5].id, "2026-02-20", "late"],
      [tourist5.id, tours[5].id, "2026-02-20", "absent"],
      [tourist1.id, tours[5].id, "2026-02-21", "present"],
      [tourist2.id, tours[5].id, "2026-02-21", "present"],
      [tourist3.id, tours[5].id, "2026-02-21", "present"],
      [tourist4.id, tours[5].id, "2026-02-21", "present"],
      [tourist5.id, tours[5].id, "2026-02-21", "late"],
      [tourist1.id, tours[6].id, "2026-01-10", "present"],
      [tourist2.id, tours[6].id, "2026-01-10", "present"],
      [tourist3.id, tours[6].id, "2026-01-10", "present"],
      [tourist4.id, tours[6].id, "2026-01-10", "absent"],
      [tourist1.id, tours[7].id, "2026-01-20", "present"],
      [tourist2.id, tours[7].id, "2026-01-20", "present"],
    ];
    for (const [uid, tid, date, status] of attendanceData) {
      await client.query(
        `INSERT INTO attendance (user_id, tour_id, date, status) VALUES ($1, $2, $3, $4)`,
        [uid, tid, date, status]
      );
    }
    console.log(`✓ Created ${attendanceData.length} attendance records`);

    // ─── Tour Users (Participants) ─────────────────────────────────────────────
    // Assign tourists to tours
    const tourUsersData = [
      // Mumbai City Tour (ongoing) - tours[5]
      [tours[5].id, tourist1.id, "participant"],
      [tours[5].id, tourist2.id, "participant"],
      [tours[5].id, tourist3.id, "participant"],
      [tours[5].id, tourist4.id, "participant"],
      [tours[5].id, tourist5.id, "participant"],
      // Golden Triangle Tour (planned) - tours[0]
      [tours[0].id, tourist1.id, "participant"],
      [tours[0].id, tourist2.id, "participant"],
      [tours[0].id, tourist3.id, "participant"],
      // Gujarat Heritage Tour (planned) - tours[1]
      [tours[1].id, tourist4.id, "participant"],
      [tours[1].id, tourist5.id, "participant"],
      // Kerala Backwaters (planned) - tours[2]
      [tours[2].id, tourist1.id, "participant"],
      [tours[2].id, tourist3.id, "participant"],
      [tours[2].id, tourist5.id, "participant"],
      // Rajasthan Royal Tour (planned) - tours[3]
      [tours[3].id, tourist2.id, "participant"],
      [tours[3].id, tourist4.id, "participant"],
      // Himachal Adventure (planned) - tours[4]
      [tours[4].id, tourist1.id, "participant"],
      [tours[4].id, tourist2.id, "participant"],
      [tours[4].id, tourist3.id, "participant"],
      [tours[4].id, tourist4.id, "participant"],
      [tours[4].id, tourist5.id, "participant"],
    ];
    for (const [tid, uid, role] of tourUsersData) {
      await client.query(
        `INSERT INTO tour_users (tour_id, user_id, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
        [tid, uid, role]
      );
    }
    console.log(`✓ Created ${tourUsersData.length} tour user assignments`);

    // ─── Incidents ────────────────────────────────────────────────────────────
    const incidentData = [
      [
        tours[0].id,
        guide1.id,
        "Participant felt unwell",
        "Tourist reported dizziness during Hawa Mahal visit. First aid administered.",
        "Hawa Mahal, Jaipur",
        "MEDIUM",
        "RESOLVED",
      ],
      [
        tours[1].id,
        guide2.id,
        "Bus breakdown",
        "Bus broke down on highway. Replacement arranged within 2 hours.",
        "NH48, Gujarat",
        "HIGH",
        "RESOLVED",
      ],
      [
        tours[5].id,
        guide3.id,
        "Minor injury on houseboat",
        "Tourist slipped on wet deck. Minor bruise, no serious injury.",
        "Alleppey Backwaters, Kerala",
        "LOW",
        "OPEN",
      ],
    ];
    for (const [tid, rid, title, desc, loc, sev, stat] of incidentData) {
      await client.query(
        `INSERT INTO incidents (tour_id, reported_by, title, description, location, severity, status) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [tid, rid, title, desc, loc, sev, stat]
      );
    }
    console.log(`✓ Created ${incidentData.length} incidents`);

    // ─── Safety Protocols ─────────────────────────────────────────────────────
    const safetyData = [
      [
        tours[0].id,
        "Emergency Contact",
        "All participants must share emergency contact number before boarding.",
        "high",
      ],
      [
        tours[0].id,
        "Medical Kit",
        "First aid kit available with tour guide at all times.",
        "medium",
      ],
      [
        tours[2].id,
        "Houseboat Safety",
        "Life jackets mandatory when on deck. No swimming in backwaters.",
        "high",
      ],
      [
        tours[4].id,
        "Altitude Sickness",
        "Watch for signs of altitude sickness above 10,000 ft. Report immediately.",
        "high",
      ],
      [
        tours[4].id,
        "Weather Protocol",
        "Outdoor activities cancelled if wind speed exceeds 50 km/h.",
        "medium",
      ],
    ];
    for (const [tid, title, desc, sev] of safetyData) {
      await client.query(
        `INSERT INTO safety_protocols (tour_id, title, description, severity) VALUES ($1,$2,$3,$4)`,
        [tid, title, desc, sev]
      );
    }
    console.log(`✓ Created ${safetyData.length} safety protocols`);

    // ─── Audit Logs ───────────────────────────────────────────────────────────
    const auditData = [
      [admin1.id, "CREATE", "tour", tours[0].id, '{"name": "Golden Triangle Tour"}'],
      [admin1.id, "CREATE", "tour", tours[1].id, '{"name": "Gujarat Heritage Tour"}'],
      [admin1.id, "UPDATE", "tour", tours[0].id, '{"status": "planned"}'],
      [admin1.id, "CREATE", "announcement", 1, '{"title": "Welcome to Golden Triangle Tour"}'],
      [admin1.id, "CREATE", "budget", 1, '{"total_amount": 14400}'],
    ];
    for (const [uid, action, entity, eid, vals] of auditData) {
      await client.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values) VALUES ($1,$2,$3,$4,$5)`,
        [uid, action, entity, eid, vals]
      );
    }
    console.log(`✓ Created ${auditData.length} audit log entries`);

    await client.query("COMMIT");
    console.log("\n✅ Database seeded successfully!");
    console.log("\n📋 Test credentials (all use password: password123):");
    console.log("   Admin:   admin@toursync.com");
    console.log("   Guide:   guide1@toursync.com");
    console.log("   Tourist: tourist1@toursync.com");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Seeding failed, rolling back:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
