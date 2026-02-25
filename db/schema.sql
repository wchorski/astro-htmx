PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS Location (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip INTEGER NOT NULL,
  timezone TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS Course (
  id INTEGER PRIMARY KEY,
  wpPostId INTEGER UNIQUE,
  subject TEXT NOT NULL,
  description TEXT,
  "where" TEXT,
  date TEXT NOT NULL,
  dateCivil TEXT NOT NULL,
  locationId INTEGER NOT NULL,
  FOREIGN KEY (locationId) REFERENCES Location(id)
);

CREATE TABLE IF NOT EXISTS Member (
  id INTEGER PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  middle_initial TEXT,
  phone TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  address1 TEXT NOT NULL,
  address2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS Credit (
  id INTEGER PRIMARY KEY,
  memberId INTEGER NOT NULL,
  courseId INTEGER NOT NULL,
  date TEXT NOT NULL,
  grade TEXT,
  attended INTEGER DEFAULT 0,
  FOREIGN KEY (memberId) REFERENCES Member(id),
  FOREIGN KEY (courseId) REFERENCES Course(id),
  UNIQUE (courseId, memberId)
);
