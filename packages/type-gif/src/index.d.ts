import { ITypePluginReturn } from '../../types/src';

export default function(): Omit<ITypePluginReturn, 'encoders'>;
