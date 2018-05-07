CREATE SCHEMA `blockchaincontract` DEFAULT CHARACTER SET utf8;
CREATE USER 'blockchaincontract'@'%' IDENTIFIED BY 'mypassword';
GRANT ALL PRIVILEGES ON blockchaincontract . * TO 'blockchaincontract'@'%';
FLUSH PRIVILEGES;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
