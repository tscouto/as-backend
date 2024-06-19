import { RequestHandler } from 'express';
import * as events from '../services/events';
import * as people from '../services/people';
import { z } from 'zod';

export const getAll: RequestHandler = async (req, res) => {
  const itens = await events.getAll();
  if (itens) return res.json({ events: itens });

  res.json({ error: 'Ocorreu um erro' });
};

export const getOne: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const eventId = await events.getOne(parseInt(id));
  if (eventId) return res.json({ events: eventId });

  res.json({ error: 'Ocorreu um erro' });
};

export const addEvent: RequestHandler = async (req, res) => {
  const addEventSchema = z.object({
    title: z.string(),
    description: z.string(),
    grouped: z.boolean(),
  });

  const body = addEventSchema.safeParse(req.body);
  if (!body.success) return res.json({ error: 'Dados invalidos' });
  const newEvent = await events.add(body.data);
  if (newEvent) return res.status(201).json({ event: newEvent });

  res.json({ error: 'Ocorreu um erro' });
};

export const updateEvent: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const updateEventSchema = z.object({
    status: z.boolean().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    grouped: z.boolean().optional(),
  });
  const body = updateEventSchema.safeParse(req.body);
  if (!body.success) return res.json({ error: 'Dados invalidos' });

  const updateEvent = await events.update(parseInt(id), body.data);
  if (updateEvent) {
    if (updateEvent.status) {
      //TODO: Fazer o sorteio
      const result = await events.doMatches(parseInt(id));
      if (!result) return res.json({ error: 'Grupos impossiveis de sortear' });
    } else {
      // TODO: Limpar o sorteio
      await people.update({ id_event: parseInt(id) }, { matched: '' });
    }
    return res.status(201).json({ event: updateEvent });
  }

  res.json({ error: 'Ocorreu um erro' });
};

export const deleteEvent: RequestHandler = async (req, res) => {
  const { id } = req.params;

  const deleteEvent = await events.remove(parseInt(id));
  if (deleteEvent) return res.json({ events: deleteEvent });
  res.json({ error: 'Ocorreum erro' });
};
