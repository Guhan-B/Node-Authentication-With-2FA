CREATE SCHEMA IF NOT EXISTS `express-2fa`;

USE `express-2fa`;

CREATE TABLE IF NOT EXISTS `user` (
	id            VARCHAR(32)     NOT NULL UNIQUE,
    name          VARCHAR(128)    NOT NULL,
    email         VARCHAR(256)    NOT NULL UNIQUE,
    password      VARCHAR(256)    NOT NULL,
    avatar        INT             NOT NULL DEFAULT 1,
    created_at    VARCHAR(32)     NOT NULL,
    
    CONSTRAINT pk_session_id PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS `session` (
	id            VARCHAR(32)     NOT NULL UNIQUE,
    user_id       VARCHAR(64)     NOT NULL,
    token         VARCHAR(256)    NOT NULL UNIQUE,
    created_at    VARCHAR(32)     NOT NULL,
    
    CONSTRAINT pk_session_id   PRIMARY KEY (id),
    CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES user(id)
);

CREATE TABLE IF NOT EXISTS `verification` (
	id            VARCHAR(32)     NOT NULL UNIQUE,
    user_id       VARCHAR(32)     NOT NULL,
    code          INT             NOT NULL,
    token         VARCHAR(256)    NOT NULL UNIQUE,
    created_at    VARCHAR(32)     NOT NULL,
    
    CONSTRAINT pk_verification_id   PRIMARY KEY (id),
    CONSTRAINT fk_verification_user FOREIGN KEY (user_id) REFERENCES user(id)
);

CREATE USER 'node'@'%' IDENTIFIED BY 'node';

GRANT SELECT, INSERT, DELETE, UPDATE, CREATE TEMPORARY TABLES, EXECUTE ON `express-2fa`.* TO 'node'@'%';