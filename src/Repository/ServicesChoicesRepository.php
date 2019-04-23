<?php

namespace App\Repository;

use App\Entity\ServicesChoices;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Symfony\Bridge\Doctrine\RegistryInterface;

/**
 * @method ServicesChoices|null find($id, $lockMode = null, $lockVersion = null)
 * @method ServicesChoices|null findOneBy(array $criteria, array $orderBy = null)
 * @method ServicesChoices[]    findAll()
 * @method ServicesChoices[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ServicesChoicesRepository extends ServiceEntityRepository
{
    public function __construct(RegistryInterface $registry)
    {
        parent::__construct($registry, ServicesChoices::class);
    }

    // /**
    //  * @return ServicesChoices[] Returns an array of ServicesChoices objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('s')
            ->andWhere('s.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('s.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?ServicesChoices
    {
        return $this->createQueryBuilder('s')
            ->andWhere('s.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
