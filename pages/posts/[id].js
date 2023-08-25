import { Amplify, API, withSSRContext } from 'aws-amplify';
import Head from 'next/head';
import { useRouter } from 'next/router';
import awsExports from '@/src/aws-exports';
import { deletePost } from '@/src/graphql/mutations';
import { getPost } from '@/src/graphql/queries';
//import styles from '../../styles/Home.module.css';

Amplify.configure({ ...awsExports, ssr: true });

export async function getServerSideProps({ req, params }) {
  const SSR = withSSRContext({ req });
  const { data } = await SSR.API.graphql({
    query: getPost,
    variables: {
      id: params.id
    }
  });
  return { 
    props: {
      post: data.getPost
    }
  };
}

export default function Post({ post }) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className="">
        <h1 className="">Loading&hellip;</h1>
      </div>
    );
  }

  async function handleDelete() {
    try {
      await API.graphql({
        authMode: 'AMAZON_COGNITO_USER_POOLS',
        query: deletePost,
        variables: {
          input: { id: post.id }
        }
      });

      window.location.href = '/';
    } catch ({ errors }) {
      console.log("Log in");
      
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
    <Head>
      <title>{post.title} – Amplify + Next.js</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>
  
    <main className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-semibold mb-4">{post.title}</h1>
  
      <p className="mb-4">{post.content}</p>
    </main>
  
    <footer className="bg-white border-t py-4 px-4 flex justify-end">
      <button
        onClick={handleDelete}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
      >
        💥 Delete post
      </button>
    </footer>
  </div>
  
  );
}