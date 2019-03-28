<?php

namespace App\Repository;

use App\Entity\Contactinfo;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Symfony\Bridge\Doctrine\RegistryInterface;

/**
 * @method Contactinfo|null find($id, $lockMode = null, $lockVersion = null)
 * @method Contactinfo|null findOneBy(array $criteria, array $orderBy = null)
 * @method Contactinfo[]    findAll()
 * @method Contactinfo[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ContactinfoRepository extends ServiceEntityRepository
{
    public function __construct(RegistryInterface $registry)
    {
        parent::__construct($registry, Contactinfo::class);
    }

    // /**
    //  * @return Contactinfo[] Returns an array of Contactinfo objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('c.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?Contactinfo
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
