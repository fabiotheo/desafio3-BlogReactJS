import { GetServerSideProps, GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';

import { FiCalendar } from 'react-icons/fi';
import { IoPersonOutline } from 'react-icons/io5';
import { BiTimeFive } from 'react-icons/bi';
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: string;
    };
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  return (
    <>
      <Head>
        <title>Home | Blog Desafio</title>
      </Head>
      <img
        className={styles.imgBackground}
        src={post.data.banner.url}
        alt="imagem"
      />
      <main className={styles.contentContainer}>
        <div className={styles.apresentation}>
          <h1>{post.data.title}</h1>
          <section className={styles.details}>
            <FiCalendar className={styles.calendarIcon} />
            <time>{post.first_publication_date}</time>
            <IoPersonOutline className={styles.personIcon} />
            <span>{post.data.author}</span>
            <BiTimeFive className={styles.personIcon} />
            <span>4 min</span>
            <p>* Editado em 19 de mar 2021, às 15:00</p>
          </section>
        </div>
        <div className={styles.content}>
          <h2>{post.data.content.heading}</h2>
          <div dangerouslySetInnerHTML={{ __html: post.data.content.body }} />
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const postFetch = await prismic.getByUID('posts', String(slug), {});

  const [body] = postFetch.data.content.map(data => {
    return RichText.asHtml(data.body);
  });

  const post = {
    first_publication_date: new Date(
      postFetch.first_publication_date
    ).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    data: {
      title: postFetch.data.title,
      banner: {
        url: String(postFetch.data.banner.url),
      },
      author: String(postFetch.data.author),
      content: {
        heading: postFetch.data.content[0].heading,
        body,
      },
    },
  };

  console.log(post.data.content);

  /*
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
   */

  return {
    props: {
      post,
    },
  };
};
