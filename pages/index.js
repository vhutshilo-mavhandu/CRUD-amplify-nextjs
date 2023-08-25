// pages/index.js
import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify, API, Auth, withSSRContext } from 'aws-amplify';
import Head from 'next/head';
import awsExports from '@/src/aws-exports';
import { createPost } from '@/src/graphql/mutations';
import { listPosts } from '@/src/graphql/queries';
//import styles from '../styles/Home.module.css';

Amplify.configure({ ...awsExports, ssr: true });

export async function getServerSideProps({ req }) {
  const SSR = withSSRContext({ req });
  
  try {
    const response = await SSR.API.graphql({ query: listPosts, authMode: 'API_KEY' });
    return {
      props: {
        posts: response.data.listPosts.items,
      },
    };
  } catch (err) {
    console.log(err);
    return {
      props: {},
    };
  }
}

async function handleCreatePost(event) {
  event.preventDefault();

  const form = new FormData(event.target);

  try {
    const { data } = await API.graphql({
      authMode: 'AMAZON_COGNITO_USER_POOLS',
      query: createPost,
      variables: {
        input: {
          title: form.get('title'),
          content: form.get('content')
        }
      }
    });

    window.location.href = '/';
  } catch ({ errors }) {
    console.error(...errors);
    throw new Error(errors[0].message);
  }
}

export default function Home({ posts = [] }) {
  return (
    <div className="min-h-screen bg-gray-100">
  <Head>
    <title>Amplify + Next.js</title>
    <link rel="icon" href="/favicon.ico" />
  </Head>

  <main className="max-w-3xl mx-auto py-10 px-4">
    <h1 className="text-3xl font-semibold mb-4">Amplify + Next.js</h1>

    <p className="mb-2">
      <code className="font-mono">{posts.length}</code>
      posts
    </p>

    <div className="space-y-4">
      {posts.map((post) => (
        <a
          className="block border p-4 rounded-lg shadow-md hover:bg-gray-200 transition"
          href={`/posts/${post.id}`}
          key={post.id}
        >
          <h3 className="text-lg font-semibold">{post.title}</h3>
          <p className="text-gray-600">{post.content}</p>
        </a>
      ))}

      <div className="border p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">New Post</h3>

        <Authenticator>
          <form onSubmit={handleCreatePost}>
            <fieldset className="mb-2">
              <legend className="font-semibold">Title</legend>
              <input
                className="w-full border rounded p-2"
                defaultValue={`Today, ${new Date().toLocaleTimeString()}`}
                name="title"
              />
            </fieldset>

            <fieldset className="mb-2">
              <legend className="font-semibold">Content</legend>
              <textarea
                className="w-full border rounded p-2"
                defaultValue="I built an Amplify project with Next.js!"
                name="content"
              />
            </fieldset>

            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
              Create Post
            </button>
            <button
              type="button"
              onClick={() => Auth.signOut()}
              className="ml-2 border px-4 py-2 rounded text-gray-600 hover:bg-gray-100 transition"
            >
              Sign out
            </button>
          </form>
        </Authenticator>
      </div>
    </div>
  </main>
</div>

  );
}