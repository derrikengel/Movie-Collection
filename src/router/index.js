import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
            children: [
                {
                    path: ':title',
                    name: 'moviedetails',
                    component: () => import('../components/MovieDetails.vue')
                }
            ]
        },
        {
            path: '/add',
            name: 'add',
            meta: {
                title: 'Add Movie'
            },
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/AdminView.vue')
        },
        {
            path: '/:title/edit',
            name: 'edit',
            meta: {
                title: 'Edit Movie'
            },
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/AdminView.vue')
        }
    ]
})

router.beforeEach((to, from, next) => {
    document.title = to.meta?.title ? to.meta.title + ' | Movie Collection' : 'Movie Collection';
    next();
});

export default router