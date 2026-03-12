<template>
    <div :class="s.login">
        <div :class="s.card">
            <h1 :class="s.title">Sign in</h1>

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
    </div>
</template>

<script setup>
    import { ref } from 'vue'
    import { useRouter } from 'vue-router'
    import { useAuthStore } from '@/stores/auth'
    const auth = useAuthStore()
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
        container-type: inline-size;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: calc(100dvh - var(--header-height));
        padding: var(--content-padding);
    }

    .card {
        width: 100%;
        max-width: 360px;
    }

    .title {
        font-size: var(--text-2xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-text);
        margin-bottom: var(--space-6);
    }

    .form {
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
    }

    .label {
        font-size: var(--text-sm);
        font-weight: var(--font-weight-medium);
        color: var(--color-text-secondary);
    }

    .input {
        padding: var(--space-3) var(--space-4);
        font-size: var(--text-base);
        background: var(--color-surface);
        border: 1px solid var(--color-border);
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
        font-size: var(--text-sm);
        color: var(--color-error);
    }

    .submit {
        padding: var(--space-3) var(--space-4);
        font-size: var(--text-base);
        font-weight: var(--font-weight-semibold);
        background: var(--color-accent);
        color: var(--color-text-on-accent);
        border: none;
        border-radius: var(--radius-md);
        transition: background var(--transition-fast);
    }

    .submit:hover:not(:disabled) {
        background: var(--color-accent-bright);
    }

    .submit:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
