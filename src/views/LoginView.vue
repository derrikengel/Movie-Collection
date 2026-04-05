<template>
    <div :class="s.login">
        <div :class="s.card">

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

                <button type="submit" :class="s.submit" :disabled="loading || !email || !password">
                    {{ loading ? 'Signing in…' : 'Sign in' }}
                </button>
            </form>
        </div>
    </div>
</template>

<script setup>
    import { ref } from 'vue'
    import { useRouter } from 'vue-router'
    import { useAuthStore } from '@/stores/auth'
    import { useToastStore } from '@/stores/toast'
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
            toast.show(`Signed in as ${auth.displayName}`)
            router.push('/')
        } catch (err) {
            errorMsg.value = 'Invalid email or password.'
        } finally {
            loading.value = false
        }
    }
</script>

<style module="s">
    .login {
        align-items: center;
        container-type: inline-size;
        display: flex;
        justify-content: center;
    }

    .card {
        background: var(--blue-900);
        border: 1px solid var(--blue-800);
        border-radius: var(--radius-lg);
        max-width: 24rem;
        width: 100%;
        padding: var(--size-4);

        @media (min-width: 64rem) {
            padding: var(--size-6);
        }
    }

    .form {
        display: flex;
        flex-direction: column;
        gap: var(--size-4);
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: var(--size-2);
    }

    .label {
        color: var(--blue-100);
        font-weight: var(--font-weight-semibold);
    }

    .input {
        background: var(--color-bg);
        padding: var(--size-3) var(--size-4);
        font-size: var(--text-base);
        border: 1px solid var(--blue-700);
        border-radius: var(--radius-md);
        color: var(--color-text);
        outline: none;
        transition: border-color var(--transition-fast);
    }

    .input::placeholder {
        color: var(--color-text-muted);
    }

    .input:focus {
        border-color: var(--color-border-strong);
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
        background: var(--green-400);
        border: none;
        border-radius: var(--radius-md);
        color: var(--green-800);
        font-size: var(--text-base);
        font-weight: var(--font-weight-semibold);
        padding: var(--size-3) var(--size-4);
        transition: background var(--transition-fast), color var(--transition-fast);
    }

    .submit:hover:not(:disabled) {
        background: var(--green-500);
        color: var(--green-900);
    }

    .submit:disabled {
        background: var(--blue-500);
        color: var(--blue-900);
        cursor: not-allowed;
        opacity: 0.5;
    }
</style>
