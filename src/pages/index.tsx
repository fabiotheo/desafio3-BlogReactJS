import { GetStaticProps } from 'next';
import querystring, { ParsedUrlQuery } from 'querystring';

import Head from 'next/head';
import Link from 'next/link';

import { FiCalendar } from 'react-icons/fi';
import { IoPersonOutline } from 'react-icons/io5';
import Prismic from '@prismicio/client';
// import { RichText } from 'prismic-dom';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useEffect, useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  slug?: string;
  data: {
    title: string;
    subtitle: string;
    author: string;
    slug?: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const { results, next_page } = postsPagination;
  const [nextPage, setNextPage] = useState<string>();

  const [newPage, setNewPage] = useState<Post[]>();

  useEffect(() => {
    if (next_page) {
      setNextPage(next_page);
    }
  }, []);
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async function HandleSearchNextPage(): Promise<void> {
    if (nextPage) {
      await fetch(nextPage)
        .then(response => response.json())
        .then((data: PostPagination) => {
          if (data.next_page) {
            setNextPage(data.next_page);
          } else {
            setNextPage('');
          }

          // eslint-disable-next-line array-callback-return
          data.results.map(result => {
            if (newPage) {
              setNewPage([...newPage, result]);
            } else {
              setNewPage([result]);
            }
          });

          // setNewPage([...newPage]);
        });
    } else {
      setNextPage('');
    }
  }

  return (
    <>
      <Head>
        <title>Home | Blog Desafio</title>
      </Head>
      <main className={styles.contentContainer}>
        <div className={styles.posts}>
          {results.map(post => (
            <Link href={`/post/${post.slug}`} key={post.uid}>
              <a>
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle}</p>
                <section>
                  <FiCalendar className={styles.calendarIcon} />
                  <time>{post.first_publication_date}</time>
                  <IoPersonOutline className={styles.personIcon} />
                  <span>{post.data.author}</span>
                </section>
              </a>
            </Link>
          ))}
          {newPage
            ? newPage.map(page => (
                <Link href={`/post/${page.uid}`} key={page.uid}>
                  <a>
                    <h1>{page.data.title}</h1>
                    <p>{page.data.subtitle}</p>
                    <section>
                      <FiCalendar className={styles.calendarIcon} />
                      <time>
                        {new Date(
                          page.first_publication_date
                        ).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </time>
                      <IoPersonOutline className={styles.personIcon} />
                      <span>{page.data.author}</span>
                    </section>
                  </a>
                </Link>
              ))
            : ''}
        </div>

        {nextPage ? (
          <button
            type="button"
            className={styles.buttonLoadPosts}
            onClick={HandleSearchNextPage}
          >
            Carregar mais posts
          </button>
        ) : (
          ''
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['post.title', 'post.subtitle'],
      pageSize: 1,
    }
  );
  /*
   page: 1,
  results_per_page: 5,
  results_size: 2,
  total_results_size: 2,
  total_pages: 1,
  next_page: null,
  prev_page: null,
  results: posts[]
   */

  const posts = postsResponse.results.map(post => ({
    slug: post.slugs[0],
    uid: post.id,
    first_publication_date: new Date(
      post.last_publication_date
    ).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
      slug: post.slugs[0],
    },
  }));

  const { next_page } = postsResponse;

  /*
  https://desafio-3.cdn.prismic.io/api/v2/documents/search?ref=YKuiyhEAACIAgrn5&q=%5B%5Bat%28document.type%2C+%22posts%22%29%5D%5D&page=2&pageSize=2
   */

  /*
  let nextPageQuery: ParsedUrlQuery = { ref: '' };

  if (next_page) {
    const [, nextPage] = next_page.split('?');
    nextPageQuery = querystring.parse(nextPage);
  }
   */

  const postsPagination = { next_page, results: posts };

  return {
    props: {
      postsPagination,
    },
  };
};
