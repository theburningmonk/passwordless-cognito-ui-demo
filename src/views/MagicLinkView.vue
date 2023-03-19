<script setup>
import { ref, onMounted } from 'vue'
import { Amplify, Auth } from 'aws-amplify'
import Nav from '../components/NavComponent.vue'
import Footer from '../components/FooterComponent.vue'
import Chance from 'chance'

Amplify.configure({
  Auth: {
    region: 'eu-west-1',
    userPoolId: 'eu-west-1_pGrFMP8ZY',
    userPoolWebClientId: '497jneqd1e2lr99ud9mfghhf31',
    mandatorySignIn: true
  }
})

const email = ref('')
const signInStep = ref('SEND_MAGIC_LINK')
const isSignedUp = ref(false)
const isSignedIn = ref(false)
let cognitoUser

async function signUp() {
  try {
    const chance = new Chance()
    const password = chance.string({ length: 16 })
    const signInResult = await Auth.signUp({
      username: email.value,
      password
    })
    console.log(signInResult.user)

    isSignedUp.value = true
  } catch (error) {
    alert(error.message)
  }
}

async function sendMagicLink() {
  const response = await fetch('https://6yi47dij2c.execute-api.eu-west-1.amazonaws.com/dev/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email.value
    })
  }).catch(err => {
    alert(`Failed to send magic link: ${err.message}`)
  })

  if (response.status !== 202) {
    const responseBody = await response.json()
    alert(`Failed to send magic link: ${responseBody.message}`)
  } else {
    signInStep.value = 'SENT_MAGIC_LINK'
  }
}

async function signIn(email) {
  try {
    cognitoUser = await Auth.signIn(email)
    console.log(cognitoUser)

    signInStep.value = 'CUSTOM_CHALLENGE'
  } catch (error) {
    alert(error.message)
  }
}

async function answerCustomChallenge(token) {
  try {
    const challengeResult = await Auth.sendCustomChallengeAnswer(cognitoUser, token)
    console.log('challenge result')
    console.log(challengeResult)
  } catch (error) {
    console.log(error)
    signInStep.value = 'SIGN_IN'
    alert(`The token is invalid.`)
  }  
}

async function signOut() {
  await Auth.signOut()
  cognitoUser = null
  isSignedIn.value = false
  signInStep.value = 'SEND_MAGIC_LINK'

  console.log(await Auth.currentUserInfo())
}

onMounted(async () => {  
  // the search string looks like "?email=xxx&token=yyy"
  if (window.location.search) {
    const qs = window.location.search.substring(1)
    const qsParams = qs.split(['&'])
    const qsEmail = qsParams.find(x => x.startsWith('email='))
    const qsToken = qsParams.find(x => x.startsWith('token='))
    if (qsToken) {
      const email = decodeURIComponent(qsEmail.substring(6))
      await signIn(email)
      
      const token = decodeURIComponent(qsToken.substring(6))
      console.log(token)
      await answerCustomChallenge(token)
    }
  }  
})
</script>

<template>
  <Nav/>

  <div>
    <h1 class="font-bold text-4xl mb-12">Passwordless authentication with magic links with Cognito</h1>

    <div class="w-1/2 flex-row mb-10">
      <h2 class="font-semibold text-xl">Step 1. register a user (if you haven't already)</h2>

      <input 
        v-if="!isSignedUp"
        v-model="email" 
        type="text"
        class="mt-2 w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        placeholder="Email address">

      <button 
        v-if="!isSignedUp"
        @click="signUp" 
        class="mt-2 py-2 px-4 border border-transparent font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        Create user
      </button>

      <p v-if="isSignedUp">Great, the user has been created in Cognito.</p>
    </div>

    <div class="w-1/2 flex-row mb-10">
      <h2 class="font-semibold text-xl">Step 2. sign in with magic links</h2>

      <input 
        v-model="email" 
        type="text"
        class="mt-2 w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        placeholder="Email address">

      <button v-if="signInStep === 'SEND_MAGIC_LINK'"
        @click="sendMagicLink"
        class="mt-2 py-2 px-4 border border-transparent font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        Send magic link
      </button>
      
      <p v-if="signInStep === 'SENT_MAGIC_LINK'">Check your email for a magic link.</p>
    </div>

    <div v-if="isSignedIn" class="w-1/2 flex-row mb-10">
      <h2 class="font-semibold text-xl">Step 3. you're signed in! Sign out and try again.</h2>

      <button v-if="isSignedIn"
        @click="signOut" 
        class="mt-2 py-2 px-4 border border-transparent font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        Sign out
      </button>
    </div>
  </div>

  <Footer/>
</template>