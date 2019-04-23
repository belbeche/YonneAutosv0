<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Entity(repositoryClass="App\Repository\ServicesChoicesRepository")
 */
class ServicesChoices
{
    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="string")
     * @Assert\Type(type="App\Form\ServicesChoices")
     * @Assert\Valid()
     * @ORM\ManyToOne(targetEntity="App\Entity\ServicesChoices", inversedBy="getOptionsShow")
     */
    private $options;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getOptions()
    {
        return $this->options;
    }

    public function setOptions(ServicesChoices $options): self
    {
        $this->ServicesChoices = $options;

        return $this;
    }

    public function getAjouts(): ?string
    {
        return $this->ajouts;
    }

    public function setAjouts(?string $ajouts): self
    {
        $this->ajouts = $ajouts;

        return $this;
    }

    public function getAddAjouts(): ?string
    {
        return $this->AddAjouts;
    }

    public function setAddAjouts(string $AddAjouts): self
    {
        $this->AddAjouts = $AddAjouts;

        return $this;
    }

    public function getBatterie(): ?string
    {
        return $this->Batterie;
    }

    public function setBatterie(string $Batterie): self
    {
        $this->Batterie = $Batterie;

        return $this;
    }

    public function getDiagnostic(): ?string
    {
        return $this->Diagnostic;
    }

    public function setDiagnostic(?string $Diagnostic): self
    {
        $this->Diagnostic = $Diagnostic;

        return $this;
    }

    public function getEchappement(): ?string
    {
        return $this->Echappement;
    }

    public function setEchappement(?string $Echappement): self
    {
        $this->Echappement = $Echappement;

        return $this;
    }

    public function getGeometrie(): ?string
    {
        return $this->Geometrie;
    }

    public function setGeometrie(?string $Geometrie): self
    {
        $this->Geometrie = $Geometrie;

        return $this;
    }

    public function getImmatriculation(): ?string
    {
        return $this->Immatriculation;
    }

    public function setImmatriculation(?string $Immatriculation): self
    {
        $this->Immatriculation = $Immatriculation;

        return $this;
    }

    public function getSuspension(): ?string
    {
        return $this->Suspension;
    }

    public function setSuspension(?string $Suspension): self
    {
        $this->Suspension = $Suspension;

        return $this;
    }

    public function getVidange(): ?string
    {
        return $this->Vidange;
    }

    public function setVidange(?string $Vidange): self
    {
        $this->Vidange = $Vidange;

        return $this;
    }
}
