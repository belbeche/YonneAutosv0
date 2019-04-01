<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190331020645 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE services_form (id INT AUTO_INCREMENT NOT NULL, get_userinfo_id INT NOT NULL, basic VARCHAR(30) DEFAULT NULL, confort VARCHAR(30) DEFAULT NULL, assistance VARCHAR(30) DEFAULT NULL, ouvertures VARCHAR(30) DEFAULT NULL, created_at DATETIME DEFAULT NULL, demande_en_ligne VARCHAR(255) NOT NULL, sav VARCHAR(255) DEFAULT NULL, nos_packs VARCHAR(255) DEFAULT NULL, INDEX IDX_D6B1A5FE985DF79F (get_userinfo_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE user (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(180) DEFAULT NULL, roles JSON NOT NULL, password VARCHAR(255) DEFAULT NULL, created_at DATETIME DEFAULT NULL, nom VARCHAR(30) DEFAULT NULL, prenom VARCHAR(30) DEFAULT NULL, telephone BIGINT DEFAULT NULL, message LONGTEXT DEFAULT NULL, UNIQUE INDEX UNIQ_8D93D649E7927C74 (email), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE services_form ADD CONSTRAINT FK_D6B1A5FE985DF79F FOREIGN KEY (get_userinfo_id) REFERENCES user (id)');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE services_form DROP FOREIGN KEY FK_D6B1A5FE985DF79F');
        $this->addSql('DROP TABLE services_form');
        $this->addSql('DROP TABLE user');
    }
}
