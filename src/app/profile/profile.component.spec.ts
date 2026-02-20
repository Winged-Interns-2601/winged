import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ProfileComponent } from './profile.component';
import { ProjectsService } from '../services/projects.service';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('addSkill() should open the skill modal and clear newSkill', () => {
    component.newSkill = 'existing-skill';
    component.showSkillModal = false;

    component.addSkill();

    expect(component.newSkill).toBe('');
    expect(component.showSkillModal).toBeTrue();
  });

  it('openNewProjectModal() should reset editProject and open the project modal', () => {
    component.editingId = 42 as any;
    component.editProject = { title: 'Old', tech: 'OldTech' } as any;
    component.showProjectModal = false;

    component.openNewProjectModal();

    expect(component.editingId).toBeNull();
    expect(component.editProject.title).toBe('');
    expect(component.editProject.tech).toBe('');
    expect(component.showProjectModal).toBeTrue();
  });

  it('saveEdit() should call updateProject when editingId is numeric string', () => {
    const projectsService = TestBed.inject(ProjectsService);
    spyOn(projectsService, 'updateProject');
    spyOn(projectsService, 'addProject');

    component.editingId = '123' as any;
    component.editProject = { title: 'Updated', tech: 'T' } as any;

    component.saveEdit();

    expect(projectsService.updateProject).toHaveBeenCalledWith(123, 'Updated', 'T');
    expect(projectsService.addProject).not.toHaveBeenCalled();
  });
});
