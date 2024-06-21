CREATE SCHEMA IF NOT EXISTS `2fa`;

USE `2fa`;

CREATE TABLE user (
	id            VARCHAR(30)     NOT NULL UNIQUE,
    name          VARCHAR(128)    NOT NULL,
    email         VARCHAR(512)    NOT NULL UNIQUE,
    password      VARCHAR(256)    NOT NULL,
    avatar        INT             NOT NULL DEFAULT 1,
    created_at    VARCHAR(128)    NOT NULL,
    
    CONSTRAINT pk_session_id PRIMARY KEY (id)
);

CREATE TABLE session (
	id            VARCHAR(30)     NOT NULL UNIQUE,
    user_id       VARCHAR(64)     NOT NULL,
    token         VARCHAR(256)    NOT NULL UNIQUE,
    created_at    VARCHAR(128)    NOT NULL,
    
    CONSTRAINT pk_session_id   PRIMARY KEY (id),
    CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES user(id)
);

CREATE TABLE verification (
	id            VARCHAR(30)     NOT NULL UNIQUE,
    user_id       VARCHAR(30)     NOT NULL,
    code          INT             NOT NULL,
    token         VARCHAR(256)    NOT NULL UNIQUE,
    created_at    VARCHAR(128)    NOT NULL,
    
    CONSTRAINT pk_verification_id   PRIMARY KEY (id),
    CONSTRAINT fk_verification_user FOREIGN KEY (user_id) REFERENCES user(id)
);