<?php
/**
 * Конфигурация подключения к базе данных
 * ЖСК "Космос"
 * 
 * ВНИМАНИЕ: Измените эти настройки на ваши реальные данные БД!
 */

// Настройки подключения к базе данных
define('DB_HOST', '127.0.0.1');
define('DB_NAME', 'jsk_kosmos');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

/**
 * Класс для работы с базой данных
 */
class Database {
    private static $instance = null;
    private $connection;
    
    /**
     * Приватный конструктор (Singleton pattern)
     */
    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            
            $this->connection = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log("Ошибка подключения к БД: " . $e->getMessage());
            throw new Exception("Ошибка подключения к базе данных");
        }
    }
    
    /**
     * Получить экземпляр подключения (Singleton)
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Получить PDO соединение
     */
    public function getConnection() {
        return $this->connection;
    }
    
    /**
     * Предотвратить клонирование
     */
    private function __clone() {}
    
    /**
     * Предотвратить десериализацию
     */
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
}

/**
 * Функция-помощник для получения подключения к БД
 */
function getDB() {
    return Database::getInstance()->getConnection();
}
?>
