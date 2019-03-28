<?php

namespace App\Controller;

use App\Entity\Contactinfo;
use App\Entity\NosAnnonces;
use App\Entity\ServicesForm;
use Symfony\Component\Form\Forms;
use Doctrine\ORM\EntityManagerInterface;
use Twig\CssInliner\CssInlinerExtension;
use Symfony\Component\Form\FormTypeInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\User\User;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Constraints\Time;
use Symfony\Component\Form\Extension\Core\Type\DateType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\Extension\Core\Type\NumberType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\DateTimeType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;




class HomeController extends AbstractController
{
    /**
     * Function index : []
     * return objet + METHOD = : RESPONSE 
     */
    public function index(Request $request,$id){

        $user = new ServicesForm();

        $form = $this->createFormBuilder($user)
                ->add('ouvertures', ChoiceType::class,[
                    'choices' => [
                        'Lundi -  ' => true,
                        'Mardi - ' => true,
                        'Mercredi - ' => true,
                        'Jeudi - ' => true,
                        'Vendredi - ' => true,
                        'Samedi - ' => true,
                    ],
                    'attr' => [
                        'class' => 'time'
                    ],
                    'label_attr' => ['class' => 'label_title'],
                    'label' => 'Horraires D\'ouverture',
                    'choice_label' => function($value,$choices){

                        if($value <= 6){
                            return $choices.date('d/m/Y')." - Ouvert";
                        }else {
                            return $choices.date('d/m/Y')." - Fermer";
                        }
                        return $value;
                    }
                ])
                ->getForm();

        $form->handleRequest($request);

        $repo = $this->getDoctrine()
                ->getRepository(NosAnnonces::class)
                ->findAll($id);

        return $this->render('home/index.html.twig',[
            'ouverture' => $form->createView(),
            'annonces_views' => $repo,
        ]);
    }
    /**
     * Retourne les annonces
     *
     * @Route("/annonces/{id}", name="annonces")
     */
    public function getAnnonces($id){

        $annonces_show = $this->getDoctrine()
            ->getRepository(NosAnnonces::class)
            ->findAll($id);

        return $this->render('home/annonces.html.twig',[
            'annonces' => $annonces_show,
        ]);
    }
    /**
     * Retourne un formulaire de contact
     * @Route("/contact_me", name="contact_me")
     */
    public function getContact(Request $request, EntityManagerInterface $manager){

        $contact_me = new ServicesForm();

        $form_contact = $this->createFormBuilder($contact_me)
                ->add('DemandeEnLigne', ChoiceType::class,[
                    'choices' => [
                        'Pour une repration' => 'Pour une inscription',
                        'Pre-inscription' => 'Voir documents',
                        'Service aprés vente' => 'Vous souhaiter être informer'
                    ],
                    'attr' => [
                        'class' => 'form-control'
                    ],
                ])
                ->add('Sauvgarder', SubmitType::class,[
                    'attr' => ['class' => 'btn btn-success'],
                ])
                ->getForm();

        $form_contact->handleRequest($request);

        if($form_contact->isSubmitted() && $form_contact->isValid()){
            $manager = $this->getDoctrine()->getManager();
            $manager->persist($contact_me);
            $manager->flush();

            return $this->redirectToRoute('information',['id' => $contact_me->getId()]);
        }

        return  $this->render('home/contact_me.html.twig',[
            'contact_me' => $form_contact->createView(),
        ]);
    }
    /**
     * Retourne les information sous forme d'id 
     * Utiliser les annotations pour verifier l'user 
     * @Route("/validation/{id}", name="information")
     */
    public function getContactInformation($id,Request $request){

        $contact_information = $this->getDoctrine()
        ->getRepository(ServicesForm::class)
        ->find($id);

        $user_contact = new Contactinfo();

        $form_user = $this->createFormBuilder($user_contact)
            ->add('nom', TextType::class,[
                'attr' => [
                    'class' => 'form-control',
                ]
            ])
            ->add('prenom', TextType::class,[
                'attr' => [
                    'class' => 'form-control',
                ]
            ])
            ->add('telephone', NumberType::class,[
                'attr' => [
                    'class' => 'form-control',
                ]
            ] )
            ->add('message', TextareaType::class,[
                'attr' => [
                    'class' => 'form-control',
                ]
            ])
            ->add('Sauvgarder', SubmitType::class, [
                'attr' => [
                    'class' => 'btn btn-info'
                ]
            ])
            ->getForm();

        $form_user->handleRequest($request);

        if($form_user->isSubmitted() && $form_user->isValid()){
            $manager = $this->getDoctrine()->getManager();
            $manager->persist($user_contact);
            $manager->flush();

            return $this->redirectToRoute('confirmation_contact', ['id' => $user_contact->getId()]);
        }

        return $this->render('home/validation.html.twig', [
            'demande_en_ligne' => $contact_information,
            'contact_user' => $form_user->CreateView(),
        ]);
    }
    /**
     * Retourne les informations de contact
     *
     * @Route("/confirmation/{id}", name="confirmation_contact")
     */
    public function getConfirmContact($id){

        $user_confirmation = $this->getDoctrine()
        ->getRepository(Contactinfo::class)
        ->find($id);

        return $this->render('home/confirmation.html.twig', [
            'confirmation_contact' => $user_confirmation
        ]);
    }
}
