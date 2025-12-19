import { createRouter, createWebHistory } from 'vue-router';
import UserList from '../views/UserList.vue';
import UserForm from '../views/UserForm.vue';

const routes = [
    {
        path: '/',
        name: 'list',
        component: UserList
    },
    {
        path: '/novo',
        name: 'create',
        component: UserForm
    },
    {
        // O :id indica que esse parâmetro é dinâmico (para edição)
        path: '/editar/:id',
        name: 'edit',
        component: UserForm,
        props: true
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;