import { LocalStorage } from 'quasar'
import { Notify } from 'quasar'
import Layout from '../layouts/Layout.vue'
import Login from '../pages/Login.vue'
import NotFound from '../pages/NotFound.vue'
import Home from '../pages/Home.vue'
import Recuperar from "../pages/Recuperar.vue"


// schedules
import NewPublic from '../pages/schedules/public/New.vue'
import NewContractor from '../pages/schedules/contractor/New.vue'
import Legalization from '../pages/schedules/administrator/Legalization.vue'
import Historical from '../pages/schedules/Historical.vue'
import Request from '../pages/schedules/Request.vue'
import SignedSchedules from '../pages/schedules/SignedSchedules.vue'
import DashboardAdmin from '../pages/schedules/administrator/DashboardAdmin.vue'
import AgendasGraph from '../pages/schedules/administrator/AgendasGraph.vue'
import EditScheduleSupervisor from '../pages/schedules/administrator/EditScheduleSupervisor.vue'
import rooting from '../pages/schedules/administrator/rooting.vue'
import Amount from '../pages/schedules/administrator/Amount.vue'
import officialsschedules from '../pages/schedules/public/officialsschedules.vue'
import legalizationofficials from '../pages/schedules/public/legalizationofficials.vue'
import LegalizationDocuments from '../pages/schedules/administrator/LegalizationDocuments.vue'

import User from '../pages/User.vue'
import Profile from '../pages/Profile.vue'

const requireAuth = (to, from, next) => {
    const token = LocalStorage.getItem('token');
    if (!token) {
        // No se puede pasar del login si el usuario no inicia sesión
        LocalStorage.remove('token');
        next('/');
        Notify.create({
            icon: 'warning',
            color: 'negative',
            message: 'No ha iniciado sesión',
            position: 'top',
            timeout: 2000
        })
    } else {
        next();
    }
};

const requireRole = (roles) => (to, from, next) => {
    const user = LocalStorage.getItem('user');
    if (user && roles.includes(user.role.data)) {
        next();
    } else if (user && roles.includes(user.staffType?.data) && user.role.data !== 'supervisor') {
        next();
    } else {
        LocalStorage.remove('token');
        next('/'); // Redirigir a login si el usuario no tiene el rol adecuado
        Notify.create({
            icon: 'warning',
            color: 'negative',
            message: 'No tiene autorización para ver esta página',
            position: 'top',
            timeout: 2000
        })
    }
};


const routes = [
    { path: '/', component: Login },
    { path: "/nueva/contrasena", component: Recuperar, name: "recuperar" },
    {
        path: '/layout',
        component: Layout,
        redirect: '/layout/home',
        beforeEnter: requireAuth,
        children: [
            { path: 'perfil', component: Profile },
            { path: 'home', component: Home },

            {
                path: 'agenda',
                children: [
                    {
                        path: 'funcionario',
                        children: [
                            { path: 'crear', component: NewPublic, beforeEnter: requireRole(['publicWorker', 'supervisor']) },
                            { path: 'legalizacion', component: Legalization }
                        ]
                    },
                    {
                        path: 'contratista',
                        children: [
                            { path: 'crear', component: NewContractor, beforeEnter: requireRole(['contractor']) },
                            { path: 'legalizacion', component: Legalization }
                        ]
                    },

                    { path: 'historico', component: Historical, beforeEnter: requireRole(['supervisor', 'user']) },
                    { path: 'solicitudes', component: Request, beforeEnter: requireRole(['paymaster', 'supervisor', 'administrator']) },
                    { path: 'legalizacion', component: Legalization, beforeEnter: requireRole(['administrator', 'user', 'supervisor']) },
                    { path: 'firmadas', component: SignedSchedules, beforeEnter: requireRole(['supervisor', 'administrator', 'paymaster']) },
                    { path: 'dashboard', component: DashboardAdmin, beforeEnter: requireRole(['supervisor']) },
                    { path: 'grafica/:userId', name: 'grafica', component: AgendasGraph, beforeEnter: requireRole(['supervisor']) },
                    { path: '/agenda/:id/editar', name: 'EditScheduleSupervisor', component: EditScheduleSupervisor, beforeEnter: requireRole(['supervisor']) },
                    { path: 'rooting', name: 'rooting', component: rooting, beforeEnter: requireRole(['supervisor']) },
                    { path: 'Amount', name: 'Amount', component: Amount, beforeEnter: requireRole(['administrator']) },
                    { path: 'officialsschedules', name: 'officialsschedules', component: officialsschedules, beforeEnter: requireRole(['publicWorker', 'contractor', 'supervisor']) },
                    { path: 'legalizationofficials', name: 'legalizationofficials', component: legalizationofficials, beforeEnter: requireRole(['publicWorker', 'contractor', 'supervisor']) },
                    { path: 'LegalizationDocuments', name: 'LegalizationDocuments', component: LegalizationDocuments, beforeEnter: requireRole(['publicWorker','contractor','supervisor']) },
                ]
            },

            { path: 'usuario', component: User, beforeEnter: requireRole(['administrator']) },

        ]
    }

]

export default routes