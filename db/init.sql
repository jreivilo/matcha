DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS user_verification;
DROP TABLE IF EXISTS profile;
DROP TABLE IF EXISTS interests;
DROP TABLE IF EXISTS viewed;
DROP TABLE IF EXISTS liked;
DROP TABLE IF EXISTS matches;

CREATE TABLE user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL,
    -- Profile fields (nullable)
    gender VARCHAR(10),
    sexuality VARCHAR(10),
    biography TEXT,
    interests TEXT,
    coordinates VARCHAR(100),
    famerating INT DEFAULT 0,
    picturecount INT DEFAULT 0,
    -- Metadata
    profile_completed BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create table of unique interests
CREATE TABLE interests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    interest VARCHAR(100) NOT NULL UNIQUE
);

-- Create user verification table if needed
CREATE TABLE user_verification (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE viewed (
    user_id INT NOT NULL,
    viewed_user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (viewed_user_id) REFERENCES user(id),
    PRIMARY KEY (user_id, viewed_user_id)
);

CREATE TABLE liked (
    user_id INT NOT NULL,
    liked_user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (liked_user_id) REFERENCES user(id),
    PRIMARY KEY (user_id, liked_user_id)
);

CREATE TABLE matches (
    userone INT NOT NULL,
    usertwo INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userone) REFERENCES user(id),
    FOREIGN KEY (usertwo) REFERENCES user(id),
    PRIMARY KEY (userone, usertwo)
);