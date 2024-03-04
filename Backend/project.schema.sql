CREATE TABLE user (
	id            VARCHAR(64)     NOT NULL UNIQUE,
    name          VARCHAR(128)    NOT NULL,
    email         VARCHAR(512)    NOT NULL,
    password      VARCHAR(256)    NOT NULL,
    avatar        INT             DEFAULT 1,
    verified      INT             DEFAULT 0,
    created_at    VARCHAR(128)    NOT NULL,
    
    CONSTRAINT pk_session_id PRIMARY KEY (id)
);

CREATE TABLE session (
	id            VARCHAR(64)     NOT NULL UNIQUE,
    user_id       VARCHAR(64)     NOT NULL,
    token         VARCHAR(256)    NOT NULL,
    created_at    VARCHAR(128)    NOT NULL,
    
    CONSTRAINT pk_session_id   PRIMARY KEY (id),
    CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES User(id)
);

CREATE TABLE verification (
	id            VARCHAR(64)     NOT NULL UNIQUE,
    user_id       VARCHAR(64)     NOT NULL,
    otp           INT             NOT NULL,
    token         VARCHAR(256)    NOT NULL,
    created_at    VARCHAR(128)    NOT NULL,
    
    CONSTRAINT pk_verification_id   PRIMARY KEY (id),
    CONSTRAINT fk_verification_user FOREIGN KEY (user_id) REFERENCES user(id)
);