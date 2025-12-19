import { createRouter, createWebHistory } from 'vue-router';
import UserList from '../views/UserList.vue';
import UserForm from '../views/UserForm.vue';
import UserDetail from '../views/UserDetail.vue';
import Login from '../views/Login.vue';

const routes = [
    { path: '/login', name: 'login', component: Login },
    { path: '/', name: 'list', component: UserList },
    { path: '/novo', name: 'create', component: UserForm },
    { path: '/editar/:id', name: 'edit', component: UserForm },
    { path: '/detalhes/:id', name: 'detail', component: UserDetail }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// Proteção de rotas
router.beforeEach((to, _from, next) => {
    const token = localStorage.getItem('token');

    // Se não estiver logado e tentar acessar uma rota protegida, redireciona para o login
    if (to.name !== 'login' && !token) {
        next({ name: 'login' });
    } else {
        next();
    }
});

export default router;