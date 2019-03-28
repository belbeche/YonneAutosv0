<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190327094535 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE nos_annonces (id INT AUTO_INCREMENT NOT NULL, annee VARCHAR(30) NOT NULL, modele VARCHAR(30) NOT NULL, marque VARCHAR(30) NOT NULL, ct VARCHAR(20) NOT NULL, titre VARCHAR(255) NOT NULL, description VARCHAR(30) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE services_form DROP nos_booster, DROP technique, DROP demande_en_ligne');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('DROP TABLE nos_annonces');
        $this->addSql('ALTER TABLE services_form ADD nos_booster VARCHAR(30) DEFAULT NULL COLLATE utf8mb4_unicode_ci, ADD technique VARCHAR(30) DEFAULT NULL COLLATE utf8mb4_unicode_ci, ADD demande_en_ligne VARCHAR(30) DEFAULT NULL COLLATE utf8mb4_unicode_ci');
    }
}
