<template>
    <div :class="s.login">

        <form :class="s.form" @submit.prevent="handleSubmit">
            <div :class="s.field">
                <label for="email" :class="s.label">Email</label>
                <input id="email" v-model="email" type="email" autocomplete="email" required :disabled="loading"
                    :class="s.input" />
            </div>

            <div :class="s.field">
                <label for="password" :class="s.label">Password</label>
                <input id="password" v-model="password" type="password" autocomplete="current-password" required
                    :disabled="loading" :class="s.input" />
            </div>

            <p v-if="errorMsg" :class="s.error">{{ errorMsg }}</p>

            <button type="submit" :class="s.submit" :disabled="loading">
                {{ loading ? 'Signing in…' : 'Sign in' }}
            </button>
        </form>

    </div>
</template>

<script setup>
    import { ref } from 'vue'
    import { useRouter } from 'vue-router'
    import { useAuthStore } from '@/stores/auth'
    import { useToastStore } from '@/stores/toast'
    import userIcon from '@/assets/icons/user.svg?raw'

    const auth = useAuthStore()
    const toast = useToastStore()
    const router = useRouter()

    const email = ref('')
    const password = ref('')
    const loading = ref(false)
    const errorMsg = ref('')

    async function handleSubmit() {
        loading.value = true
        errorMsg.value = ''
        try {
            await auth.login(email.value, password.value)
            toast.success(`Signed in as`, {
                icon: userIcon,
                action: { label: auth.displayName, to: { name: 'profile' } }
            })
            router.push({ name: 'home' })
        } catch (err) {
            errorMsg.value = 'Invalid email or password.'
        } finally {
            loading.value = false
        }
    }
</script>

<style module="s">
    .login {
        background: var(--blue-800);
        border-radius: var(--radius-xl);
        flex: 0 1 30rem;
        padding: var(--size-6);

        @media (min-width: 30rem) {
            padding: var(--size-8);
        }

        @media (min-width: 64rem) {
            padding: var(--size-12);
        }
    }

    .form {
        display: flex;
        flex-direction: column;
        gap: var(--size-6);
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: var(--size-2);
    }

    .label {
        color: var(--blue-300);
        font-size: var(--text-xs);
        font-weight: var(--font-weight-bold);
        letter-spacing: var(--tracking-widest);
        text-transform: uppercase;
    }

    .input {
        background: var(--color-frosted-input);
        border: none;
        border-radius: var(--radius-lg);
        color: var(--blue-50);
        font-size: var(--text-base);
        outline: none;
        padding: var(--size-4) var(--size-5);
        transition: background var(--transition-fast);
        width: 100%;
    }

    .input::placeholder {
        color: var(--blue-100);
    }

    .input:focus {
        background: var(--color-frosted-input-focus);
    }

    .input:disabled {
        opacity: 0.5;
    }

    .error {
        color: var(--red-400);
        font-size: var(--text-sm);
        font-weight: var(--font-weight-medium);
    }

    .submit {
        background: var(--green-300);
        border: none;
        border-radius: var(--radius-full);
        color: var(--green-800);
        font-size: var(--text-xs);
        font-weight: var(--font-weight-bold);
        letter-spacing: var(--tracking-widest);
        padding: var(--size-4);
        text-transform: uppercase;
        transition: background var(--transition-fast), color var(--transition-fast);
        width: 100%;
    }

    .submit:hover:not(:disabled) {
        background: var(--green-400);
        color: var(--green-900);
    }

    .submit:disabled {
        opacity: 0.3;
    }
</style>
