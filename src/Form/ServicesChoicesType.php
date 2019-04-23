<?php

namespace App\Form;

use App\Entity\ServicesChoices;
use App\Form\ServicesChoicesType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ServicesChoicesType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('ajouts')
            ->add('AddAjouts')
            ->add('Batterie')
            ->add('Diagnostic')
            ->add('Echappement')
            ->add('Geometrie')
            ->add('Immatriculation')
            ->add('Suspension')
            ->add('Vidange')
            ->add('ShowServices')
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => ServicesChoices::class,
        ]);
    }
}
