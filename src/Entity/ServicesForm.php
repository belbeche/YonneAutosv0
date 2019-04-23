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
    * @ORM\ManyToOne(targetEntity="App\Entity\ServicesChoices", inversedBy="options")
    * @ORM\JoinColumn(nullable=false)
    */
    private $getOptionsShow;

    /**
    * @ORM\Column(type="string", length=255, nullable=true)
    */
    private $ajouts;

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

    public function getGetOptionsShow(): ?ServicesChoices
    {
        return $this->getOptionsShow;
    }

    public function setGetOptionsShow(?ServicesChoices $getOptionsShow): self
    {
        $this->getOptionsShow = $getOptionsShow;

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
}
