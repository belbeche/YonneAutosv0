<?php

namespace App\Form;

use App\Entity\NosAnnonces;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\FileType;

class NosAnnoncesType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('titre')
            ->add('description')
            ->add('img', FileType::class)
            ->add('annee')
            ->add('modele')
            ->add('marque')
            ->add('ct')
            ->add('kilometrage')
            ->add('energie')
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => NosAnnonces::class,
        ]);
    }
}
