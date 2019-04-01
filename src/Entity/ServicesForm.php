<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\ServicesFormRepository")
 */
class ServicesForm
{
    /**
    * @ORM\Id()
    * @ORM\GeneratedValue()
    * @ORM\Column(type="integer")
    */
    private $id;

    /**
     * @ORM\Column(type="string", length=30, nullable=true)
     */
    private $basic;

    /**
     * @ORM\Column(type="string", length=30, nullable=true)
     */
    private $confort;

    /**
     * @ORM\Column(type="string", length=30, nullable=true)
     */
    private $Assistance;

    /**
     * @ORM\Column(type="string", length=30, nullable=true)
     */
    private $ouvertures;

    /**
     * @ORM\Column(type="datetime", nullable=true)
     */
    private $createdAt;

    /**
     *@ORM\Column(type="string")
     */
    private $DemandeEnLigne;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $SAV;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $NosPacks;

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\User", mappedBy="getServicesForm",cascade={"persist"})
     */
    private $updateServicesForm;

    public function __construct()
    {
        $this->updateServicesForm = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getBasic(): ?string
    {
        return $this->basic;
    }

    public function setBasic(?string $basic): self
    {
        $this->basic = $basic;

        return $this;
    }

    public function getConfort(): ?string
    {
        return $this->confort;
    }

    public function setConfort(?string $confort): self
    {
        $this->confort = $confort;

        return $this;
    }

    public function getAssistance(): ?string
    {
        return $this->Assistance;
    }

    public function setAssistance(?string $Assistance): self
    {
        $this->Assistance = $Assistance;

        return $this;
    }

    public function getOuvertures(): ?string
    {
        return $this->ouvertures;
    }

    public function setOuvertures(?string $ouvertures): self
    {
        $this->ouvertures = $ouvertures;

        return $this;
    }

    public function getOuvertLe(): ?string
    {
        return $this->ouvert_le;
    }

    public function setOuvertLe(?string $ouvert_le): self
    {
        $this->ouvert_le = $ouvert_le;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setCreatedAt(?\DateTimeInterface $createdAt): self
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getDemandeEnLigne(): ?string
    {
        return $this->DemandeEnLigne;
    }

    public function setDemandeEnLigne(string $DemandeEnLigne): self
    {
        $this->DemandeEnLigne = $DemandeEnLigne;

        return $this;
    }

    public function getSAV(): ?string
    {
        return $this->SAV;
    }

    public function setSAV(string $SAV): self
    {
        $this->SAV = $SAV;

        return $this;
    }

    public function getNosPacks(): ?string
    {
        return $this->NosPacks;
    }

    public function setNosPacks(?string $NosPacks): self
    {
        $this->NosPacks = $NosPacks;

        return $this;
    }

    /**
     * @return Collection|User[]
     */
    public function getUpdateServicesForm(): Collection
    {
        return $this->updateServicesForm;
    }

    public function addUpdateServicesForm(User $updateServicesForm): self
    {
        if (!$this->updateServicesForm->contains($updateServicesForm)) {
            $this->updateServicesForm[] = $updateServicesForm;
            $updateServicesForm->setGetServicesForm($this);
        }

        return $this;
    }

    public function removeUpdateServicesForm(User $updateServicesForm): self
    {
        if ($this->updateServicesForm->contains($updateServicesForm)) {
            $this->updateServicesForm->removeElement($updateServicesForm);
            // set the owning side to null (unless already changed)
            if ($updateServicesForm->getGetServicesForm() === $this) {
                $updateServicesForm->setGetServicesForm(null);
            }
        }

        return $this;
    }
}
