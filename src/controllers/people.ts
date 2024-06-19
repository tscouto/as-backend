import { RequestHandler } from 'express';
import * as people from '../services/people';
import { z } from 'zod';
import { decryptMach } from '../utils/match';
import { error } from 'console';

export const getAll: RequestHandler = async (req, res) => {
  const { id_event, id_group } = req.params;

  const items = await people.getAll({
    id_event: parseInt(id_event),
    id_group: parseInt(id_group),
  });

  if (items) return res.json({ people: items });
  res.json({ error: 'Ocorreu um erro' });
};

export const getPerson: RequestHandler = async (req, res) => {
  const { id_event, id_group, id } = req.params;
  const items = await people.getOne({
    id: parseInt(id),
    id_group: parseInt(id_group),
    id_event: parseInt(id_event),
  });

  if (items) return res.json({ people: items });
  res.json({ error: 'Ocorreu um erro' });
};

export const addPerson: RequestHandler = async (req, res) => {
  const { id_event, id_group } = req.params;
  const addPersonSchema = z.object({
    name: z.string(),
    cpf: z.string().transform(val => val.replace(/\.|-/gm, '')),
  });
  const body = addPersonSchema.safeParse(req.body);
  if (!body.success) return res.json({ error: 'Dados invalidos' });

  const newPerson = await people.add({
    name: body.data.name,
    cpf: body.data.cpf,
    id_event: parseInt(id_event),
    id_group: parseInt(id_group),
  });

  if (newPerson) return res.status(201).json({ people: newPerson });
  res.json({ error: 'Ocorreu um erro' });
};

export const updatePerson: RequestHandler = async (req, res) => {
  const { id, id_event, id_group } = req.params;
  const updatedPersonSchema = z.object({
    name: z.string().optional(),
    cpf: z
      .string()
      .transform(val => val.replace(/\.|-/gm, ''))
      .optional(),
    matched: z.string().optional(),
  });

  const body = updatedPersonSchema.safeParse(req.body);
  if (!body.success) return res.json({ error: 'Dados invalidos' });

  const updatedPerson = await people.update(
    {
      id: parseInt(id),
      id_event: parseInt(id_event),
      id_group: parseInt(id_group),
    },
    body.data
  );
  if (updatedPerson) {
    const personItem = await people.getOne({
      id: parseInt(id),
      id_event: parseInt(id_event),
    });
    return res.json({ person: personItem });
  }

  res.json({ error: 'Ocorreu um erro' });
};

export const deletePerson: RequestHandler = async (req, res) => {
  const { id, id_event, id_group } = req.params;

  const deletePeople = await people.remove({
    id: parseInt(id),
    id_event: parseInt(id_event),
    id_group: parseInt(id_group),
  });

  if (deletePeople) return res.json({ person: deletePeople });
  res.json({ error: 'Ocorreu um erro' });
};

// export const searchPerson: RequestHandler = async (req, res) => {
//   const { id_event } = req.params;
//   const searchPersonSchema = z.object({
//     cpf: z.string(),
//   });

//   const query = searchPersonSchema.safeParse(req.query);
//   if (!query.success) return res.json({ error: 'Dados invalidos' });

//   const personItem = await people.getOne({
//     id_event: parseInt(id_event),
//     cpf: query.data.cpf,
//   });
//   if (personItem && personItem.matched) {
//     const matchId = decryptMach(personItem.matched);
//     const personMatched = await people.getOne({
//       id_event: parseInt(id_event),
//       id: matchId,
//     });
//     if (personMatched) {
//       return res.json({
//         person: {
//           id: personItem.id,
//           name: personItem.name,
//         },
//         personMatched: {
//           id: personMatched.id,
//           name: personMatched.name,
//         },
//       });
//     }
//   }
//   res.json({ error: 'Ocorreu um erro' });
// };

export const searchPerson: RequestHandler = async (req, res) => {
  const { id_event } = req.params;

  const searchPersonSchema = z.object({
    cpf: z
      .string()
      .transform(val => val.replace(/\.|-/gm, ''))
      .optional(), // Remove pontos e traços do CPF
  });

  const query = searchPersonSchema.safeParse(req.query);
  if (!query.success) {
    console.error('Dados inválidos:', req.query);
    return res.json({ error: 'Dados inválidos' });
  }

  try {
    const eventId = parseInt(id_event);
    if (isNaN(eventId)) {
      console.error('ID do evento inválido:', id_event);
      return res.json({ error: 'ID do evento inválido' });
    }

    console.log('Parsed id_event:', eventId);
    console.log('Query CPF:', query.data.cpf);

    const personItem = await people.getOne({
      id_event: eventId,
      cpf: query.data.cpf,
    });
    console.log('personItem:', personItem);

    if (personItem) {
      console.log('PersonItem encontrado:', personItem);
      if (personItem.matched) {
        const matchId = decryptMach(personItem.matched);
        console.log('matchId:', matchId);

        if (isNaN(matchId)) {
          console.error('ID do match inválido:', personItem.matched);
          return res.json({ error: 'ID do match inválido' });
        }

        const personMatched = await people.getOne({
          id_event: eventId,
          id: matchId,
        });
        console.log('personMatched:', personMatched);

        if (personMatched) {
          return res.json({
            person: {
              id: personItem.id,
              name: personItem.name,
            },
            personMatched: {
              id: personMatched.id,
              name: personMatched.name,
            },
          });
        } else {
          console.error(
            'Nenhuma correspondência encontrada para o matchId:',
            matchId
          );
        }
      } else {
        console.error(
          'PersonItem encontrado, mas sem correspondência:',
          personItem
        );
      }
    } else {
      console.error(
        'Nenhuma correspondência encontrada para o CPF:',
        query.data.cpf
      );
    }

    return res.json({ error: 'Nenhuma correspondência encontrada' });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Erro ao buscar a pessoa:', error.message);
      return res.json({
        error: 'Ocorreu um erro ao buscar a pessoa',
        detalhe: error.message,
      });
    } else {
      console.error('Erro desconhecido:', error);
      return res.json({
        error: 'Ocorreu um erro desconhecido ao buscar a pessoa',
      });
    }
  }
};
