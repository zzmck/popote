import { api } from '../services/api.js';
import { fetchState } from '../services/state.js';

export async function setPayMethods(list){ await api('PUT','/api/config/paymentMethods', { list }, true); fetchState(); }
