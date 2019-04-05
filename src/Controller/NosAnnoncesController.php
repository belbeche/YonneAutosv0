<?php

namespace App\Controller;

use App\Entity\NosAnnonces;
use App\Form\NosAnnoncesType;
use App\Repository\NosAnnoncesRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use App\UploadedFile;
use Symfony\Component\HttpFoundation\File\File;
/**
 * @Route("/nos/annonces")
 */
class NosAnnoncesController extends AbstractController
{
    /**
     * @Route("/", name="nos_annonces_index", methods={"GET"})
     */
    public function index(NosAnnoncesRepository $nosAnnoncesRepository): Response
    {
        return $this->render('nos_annonces/index.html.twig', [
            'nos_annonces' => $nosAnnoncesRepository->findAll(),
        ]);
    }

    /**
     * A revoir
     * @Route("/new", name="nos_annonces_new", methods={"GET","POST"})
     */
    public function new(Request $request,$img = ''): Response
    {
        $nosAnnonce = new NosAnnonces();

        $form = $this->createForm(NosAnnoncesType::class, $nosAnnonce);

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {

            // $file = $nosAnnonce->getImg();
            // $fileName = md5(uniqid()).'.'.$file->guessExtension();
            // $file->move($this->getParameter('upload_directory'), $fileName);
            // $nosAnnonce->setImg($fileName);

            // move to the current directory, save $name 

            // J'encode mon image charger 
           
            // $entityManager = $this->getDoctrine()->getManager();
            // $entityManager->persist($nosAnnonce);
            // $entityManager->flush();

            return $this->redirectToRoute('nos_annonces_index');
        }

        return $this->render('nos_annonces/new.html.twig', [
            'nos_annonce' => $nosAnnonce,
            'form' => $form->createView(),
        ]);
    }

    /**
     * @Route("/{id}", name="nos_annonces_show", methods={"GET"})
     */
    public function show(NosAnnonces $nosAnnonce): Response
    {
        return $this->render('nos_annonces/show.html.twig', [
            'nos_annonce' => $nosAnnonce,
        ]);
    }

    /**
     * @Route("/{id}/edit", name="nos_annonces_edit", methods={"GET","POST"})
     */
    public function edit(Request $request, NosAnnonces $nosAnnonce): Response
    {
        $form = $this->createForm(NosAnnoncesType::class, $nosAnnonce);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $this->getDoctrine()->getManager()->flush();

            return $this->redirectToRoute('nos_annonces_index', [
                'id' => $nosAnnonce->getId(),
            ]);
        }

        return $this->render('nos_annonces/edit.html.twig', [
            'nos_annonce' => $nosAnnonce,
            'form' => $form->createView(),
        ]);
    }

    /**
     * @Route("/{id}", name="nos_annonces_delete", methods={"DELETE"})
     */
    public function delete(Request $request, NosAnnonces $nosAnnonce): Response
    {
        if ($this->isCsrfTokenValid('delete'.$nosAnnonce->getId(), $request->request->get('_token'))) {
            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->remove($nosAnnonce);
            $entityManager->flush();
        }

        return $this->redirectToRoute('nos_annonces_index');
    }
}
