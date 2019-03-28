<?php

namespace App\Repository;

use App\Entity\NosAnnonces;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Symfony\Bridge\Doctrine\RegistryInterface;

/**
 * @method NosAnnonces|null find($id, $lockMode = null, $lockVersion = null)
 * @method NosAnnonces|null findOneBy(array $criteria, array $orderBy = null)
 * @method NosAnnonces[]    findAll()
 * @method NosAnnonces[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class NosAnnoncesRepository extends ServiceEntityRepository
{
    public function __construct(RegistryInterface $registry)
    {
        parent::__construct($registry, NosAnnonces::class);
    }

    // /**
    //  * @return NosAnnonces[] Returns an array of NosAnnonces objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('n')
            ->andWhere('n.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('n.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?NosAnnonces
    {
        return $this->createQueryBuilder('n')
            ->andWhere('n.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
