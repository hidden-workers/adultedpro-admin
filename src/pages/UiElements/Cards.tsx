import React from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import EventCard from '../../components/Cards/EventCard';
import CardsItemThree from '../../components/Cards/CardsItemThree';
import CardsItemTwo from '../../components/Cards/CardsItemTwo';
import DefaultLayout from '../../layout/DefaultLayout';

import CardsOne from '../../images/cards/cards-01.png';
import CardsTwo from '../../images/cards/cards-02.png';
import CardsThree from '../../images/cards/cards-03.png';
import CardsFour from '../../images/cards/cards-04.png';
import CardsFive from '../../images/cards/cards-05.png';
import CardsSix from '../../images/cards/cards-06.png';
import userEleven from '../../images/user/user-11.png';
import userTwelve from '../../images/user/user-12.png';
import userThirteen from '../../images/user/user-13.png';

const Cards: React.FC = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Cards" />

      <div className="grid grid-cols-1 gap-7.5 sm:grid-cols-2 xl:grid-cols-2">
        <EventCard
          imageSrc={userEleven}
          name="Naimur Rahman"
          role="Content Writer"
          cardImageSrc={CardsOne}
          cardTitle="Card Title here"
          cardContent="Lorem ipsum dolor sit amet, vehiculaum ero felis loreum fitiona fringilla goes scelerisque Interdum et."
        />

        <EventCard
          imageSrc={userTwelve}
          name="Musharof Chy"
          role="Web Developer"
          cardImageSrc={CardsTwo}
          cardTitle="Card Title here"
          cardContent="Lorem ipsum dolor sit amet, vehiculaum ero felis loreum fitiona fringilla goes scelerisque Interdum et."
        />

        <EventCard
          imageSrc={userThirteen}
          name="Shafiq Hammad"
          role="Front-end Developer"
          cardImageSrc={CardsThree}
          cardTitle="Card Title here"
          cardContent="Lorem ipsum dolor sit amet, vehiculaum ero felis loreum fitiona fringilla goes scelerisque Interdum et."
        />
      </div>

      <h2 className="mt-10 mb-7.5 text-title-md2 font-semibold text-black dark:text-white">
        Cards
      </h2>

      <div className="grid grid-cols-1 gap-7.5 sm:grid-cols-2 xl:grid-cols-3">
        <CardsItemTwo
          cardImageSrc={CardsFour}
          cardTitle="Card Title here"
          cardContent="Lorem ipsum dolor sit amet, vehiculaum ero felis loreum fitiona fringilla goes scelerisque Interdum et."
        />

        <CardsItemTwo
          cardImageSrc={CardsFive}
          cardTitle="Card Title here"
          cardContent="Lorem ipsum dolor sit amet, vehiculaum ero felis loreum fitiona fringilla goes scelerisque Interdum et."
        />

        <CardsItemTwo
          cardImageSrc={CardsSix}
          cardTitle="Card Title here"
          cardContent="Lorem ipsum dolor sit amet, vehiculaum ero felis loreum fitiona fringilla goes scelerisque Interdum et."
        />
      </div>

      <h2 className="mt-10 mb-7.5 text-title-md2 font-semibold text-black dark:text-white">
        Cards
      </h2>

      <div className="grid grid-cols-1 gap-7.5 sm:grid-cols-2 xl:grid-cols-3">
        <CardsItemThree
          cardTitle="Card Title here"
          cardContent="Lorem ipsum dolor sit amet, vehiculaum ero felis loreum fitiona fringilla goes scelerisque Interdum et."
        />

        <CardsItemThree
          cardTitle="Card Title here"
          cardContent="Lorem ipsum dolor sit amet, vehiculaum ero felis loreum fitiona fringilla goes scelerisque Interdum et."
        />

        <CardsItemThree
          cardTitle="Card Title here"
          cardContent="Lorem ipsum dolor sit amet, vehiculaum ero felis loreum fitiona fringilla goes scelerisque Interdum et."
        />
      </div>
    </DefaultLayout>
  );
};

export default Cards;
