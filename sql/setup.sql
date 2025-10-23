CREATE TABLE IF NOT EXISTS `nordstadt_teamler` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `admin_name` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Der Name, den der Teamler beim Login eingibt',
    `identifier` VARCHAR(60) NOT NULL COMMENT 'Die Steam- oder Discord-ID (z.B. steam:110000101234567)',
    `rank_level` INT(11) NOT NULL DEFAULT 1 COMMENT '0=Trial, 1=Moderator, 2=Admin (aktuell nur 1 genutzt)',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
);