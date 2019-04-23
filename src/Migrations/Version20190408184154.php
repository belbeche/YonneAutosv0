<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190408184154 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE services_form ADD open DATETIME NOT NULL, CHANGE options ajouts VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');
        $this->addSql('ALTER TABLE nos_annonces DROP add_file_name, CHANGE annee annee VARCHAR(30) NOT NULL, CHANGE modele modele VARCHAR(30) NOT NULL, CHANGE marque marque VARCHAR(30) NOT NULL, CHANGE ct ct VARCHAR(20) NOT NULL, CHANGE titre titre VARCHAR(255) NOT NULL, CHANGE description description VARCHAR(30) NOT NULL, CHANGE img img VARCHAR(255) NOT NULL, CHANGE kilometrage kilometrage VARCHAR(255) NOT NULL, CHANGE energie energie VARCHAR(255) NOT NULL');
        
        $this->addSql('ALTER TABLE services_form ADD CONSTRAINT FK_D6B1A5FE9E6C29A0 FOREIGN KEY (get_options_show_id) REFERENCES services_choices (id)');

        $this->addSql('ALTER TABLE user CHANGE get_services_form_id get_services_form_id INT NOT NULL, CHANGE telephone telephone BIGINT NOT NULL');
         $this->addSql('ALTER TABLE services_choices DROP show_services');
        $this->addSql('ALTER TABLE nos_annonces ADD add_file_name VARCHAR(255) NOT NULL COLLATE utf8mb4_unicode_ci, CHANGE annee annee VARCHAR(30) DEFAULT NULL COLLATE utf8mb4_unicode_ci, CHANGE modele modele VARCHAR(30) DEFAULT NULL COLLATE utf8mb4_unicode_ci, CHANGE marque marque VARCHAR(30) DEFAULT NULL COLLATE utf8mb4_unicode_ci, CHANGE ct ct VARCHAR(20) DEFAULT NULL COLLATE utf8mb4_unicode_ci, CHANGE titre titre VARCHAR(255) DEFAULT NULL COLLATE utf8mb4_unicode_ci, CHANGE description description VARCHAR(30) DEFAULT NULL COLLATE utf8mb4_unicode_ci, CHANGE img img VARCHAR(255) DEFAULT NULL COLLATE utf8mb4_unicode_ci, CHANGE kilometrage kilometrage VARCHAR(255) DEFAULT NULL COLLATE utf8mb4_unicode_ci, CHANGE energie energie VARCHAR(255) DEFAULT NULL COLLATE utf8mb4_unicode_ci');
        $this->addSql('ALTER TABLE services_choices ADD show_services VARCHAR(255) NOT NULL COLLATE utf8mb4_unicode_ci');
        $this->addSql('ALTER TABLE services_form DROP FOREIGN KEY FK_D6B1A5FE9E6C29A0');
        $this->addSql('ALTER TABLE services_form ADD ouvertures VARCHAR(30) DEFAULT NULL COLLATE utf8mb4_unicode_ci, ADD created_at DATETIME DEFAULT NULL, DROP open, CHANGE ajouts options VARCHAR(255) DEFAULT NULL COLLATE utf8mb4_unicode_ci');
        $this->addSql('ALTER TABLE user CHANGE get_services_form_id get_services_form_id INT DEFAULT NULL, CHANGE telephone telephone BIGINT DEFAULT NULL');
    }
}
