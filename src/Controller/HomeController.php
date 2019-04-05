<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\NosAnnonces;
use App\Entity\ServicesForm;
use Symfony\Component\Form\Forms;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\EntityManagerInterface;
use Twig\CssInliner\CssInlinerExtension;
use Symfony\Component\Form\FormTypeInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Validator\Constraints\Time;
use Symfony\Component\Form\Extension\Core\Type\DateType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\Extension\Core\Type\NumberType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\DateTimeType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;



class HomeController extends AbstractController
{

    public $getServicesDetails;

    /**
     * Function index : []
     * return objet + METHOD = : RESPONSE 
     * 
     */
    public function index(Request $request,$id, EntityManagerInterface $manager)
    {

        // J'integre mes champs depuis la table user à la table servicesForms

        $contact_add = new ServicesForm();

        $form_contact = $this->createFormBuilder($contact_add)
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
                        'class' => 'form-control'
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
                // Je fait la demande et je renvoi l'id
                ->add('DemandeEnLigne', ChoiceType::class,[
                    'choices' => [
                        'Pour une repration' => 'Basic: services',
                        'Pre-inscription' => 'Confort: Voir documents',
                        'Service aprés vente' => 'Assistance: Vous souhaiter être informer'
                    ],
                    'attr' => [
                        'class' => 'form-control'
                    ],
                ])
                ->add('Suivant', SubmitType::class, [
                    'attr' => [
                        'class' => 'btn btn-primary',
                    ]
                ])
                ->getForm();

        $form_contact->handleRequest($request);

        if($form_contact->isSubmitted() && $form_contact->isValid()){
            $manager = $this->getDoctrine()->getManager();
            $manager->persist($contact_add);
            $manager->flush();
            return $this->redirectToRoute('contact_add',['motif_demande' => $contact_add->getId()]);
        }

        $repo = $this->getDoctrine()
            ->getRepository(NosAnnonces::class)
            ->findAll($id);

        return $this->render('home/index.html.twig',[
            'form_index' => $form_contact->createView(),
            'annonces_views' => $repo,
        ]);
    }
    /**
     * Renvoi le formulaire avec la demande
     * @Route("/contact_add/{motif_demande}", name="contact_add")
     */

    public function getContact(Request $request,$motif_demande,EntityManagerInterface $manager)
    {
        // j'initiliase mon entité je la lie à la table user   
        $getServicesDetails = new ServicesForm();
        
        $getServicesDetails = $this->getDoctrine()
        ->getRepository(ServicesForm::class)
        ->find($motif_demande);

        // j'insere les données de demande en ligne via user:get
        $user_contact = new User();

        // j'insere l'id de la table services Form demande en ligne 

        $getServicesDetails->addUpdateServicesForm($user_contact);

        $user_form = $this->createFormBuilder($user_contact)
                ->add('nom', TextType::class)
                ->add('prenom', TextType::class)
                ->add('telephone', NumberType::class)
                ->add('message', TextareaType::class, [
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

        $user_form->handleRequest($request);

        if($user_form->isSubmitted() && $user_form->isValid()){
            $manager = $this->getDoctrine()->getManager();
            // je persist les 2 variables et je récupère l'id
            $manager->persist($user_contact);
            $manager->persist($getServicesDetails);
            $manager->flush();

            return $this->redirectToRoute('contact_confirm', ['id' => $user_contact->getId()]);
        }

        return $this->render('home/add_contact.html.Twig', [
            'contact_add' => $user_form->createView(),
            'services' => $getServicesDetails,
        ]);

        
    }
    /**
     * Renvoi les informations du formumalaires
     *
     * @Route("/contact_confirm/{id}" , name="contact_confirm")
     */
    public function getContactConfirmation($id, Request $request)
    {
        // je récupere mes motifs depuis la table user + id  depuis twig
        $user_registration = $this->getDoctrine()
        ->getRepository(User::class)
        ->find($id);

        return $this->render('home/confirmation.html.twig', [
            'user_registred' => $user_registration
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
     * Return newsletter
     *
     *@Route("/newsletter", name="newsletter")
     */
    public function getNewsletter(Request $request,EntityManagerInterface $manager){

        $newsletter = new User();


        return $this->render('home/newsletter.html.twig', [
            'form_news' => $form_news->createView(),
        ]);
    }
}
