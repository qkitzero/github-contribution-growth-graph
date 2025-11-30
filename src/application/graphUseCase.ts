export interface GraphUseCase {
  createGraph(user: string): void;
}

export class GraphUseCaseImpl implements GraphUseCase {
  constructor() {}

  createGraph(user: string): void {
    console.log(user);
  }
}
