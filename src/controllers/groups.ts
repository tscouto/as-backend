import { RequestHandler } from 'express';
import * as groups from '../services/groups';
import { z } from 'zod';
import { error } from 'console';

export const getAll: RequestHandler = async (req, res) => {
  const { id_event } = req.params;
  const items = await groups.getAll(parseInt(id_event));
  if (items) return res.json({ groups: items });

  res.json({ error: 'Ocorreu um erro' });
};

export const getGroup: RequestHandler = async (req, res) => {
  const { id, id_event } = req.params;

  const groupId = await groups.getOne({
    id: parseInt(id),
    id_event: parseInt(id_event),
  });

  if (groupId) return res.json({ groups: groupId });
  res.json({ error: 'Ocorreu um erro' });
};

export const addGroup: RequestHandler = async (req, res) => {
  const { id_event } = req.params;
  const addGroupSchema = z.object({
    name: z.string(),
  });
  const body = addGroupSchema.safeParse(req.body);
  if (!body.success) return res.json({ error: 'Dados invalido' });
  const newGroup = await groups.add({
    name: body.data.name,
    id_event: parseInt(id_event),
  });
  if (newGroup) return res.status(201).json({ groups: newGroup });
  res.json({ error: 'Ocorreu um erro' });
};

export const updateGroup: RequestHandler = async (req, res) => {
  const { id, id_event } = req.params;

  const updateGroupSchema = z.object({
    name: z.string().optional(),
  });

  const body = updateGroupSchema.safeParse(req.body);
  if (!body.success) return res.json({ error: 'Dados invalidos' });

  const updateGroup = await groups.update(
    {
      id: parseInt(id),
      id_event: parseInt(id_event),
    },
    body.data
  );
  if (updateGroup) return res.json({ groups: updateGroup });
  res.json({ error: 'Ocorreu um erro' });
};

export const deleteGroup: RequestHandler = async (req, res) => {
  const { id, id_event } = req.params;

  const deleteGroup = await groups.remove({
    id: parseInt(id),
    id_event: parseInt(id_event),
  });

  if (deleteGroup) return res.json({ groups: deleteGroup });

  res.json({ error: 'Ocorreu um erro' });
};
